require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require("express-rate-limit");
const MongoStore = require('connect-mongo').default;
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 5000;

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MONGODB_URI is not configured in the environment.');
  process.exit(1);
}

const mongoClient = new MongoClient(mongoUri);

let registrationsCollection;
let attendanceCollection;

// --------------------
// CORS
// --------------------

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigin = process.env.CLIENT_ORIGIN;

      if (
        !origin ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        origin === allowedOrigin
      ) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// --------------------
// JSON
// --------------------

app.use(express.json({ limit: '2mb' }));

// --------------------
// Session
// --------------------

app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
      client: mongoClient,
      collectionName: 'sessions',
    }),

    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

// --------------------
// Admin authentication
// --------------------

const requireAdmin = (req, res, next) => {
  if (req.session.isAdminAuthenticated === true) {
    return next();
  }

  return res
    .status(401)
    .json({
      message: 'Admin authentication required.',
    });
};
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // maximum 5 login attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please try again later.',
  },
});
// --------------------
// Registration API
// --------------------

app.post('/api/register', async (req, res) => {
  try {
    const payload = req.body;
    console.log(
  'REGISTER PAYLOAD:',
  JSON.stringify(payload, null, 2)
);

    if (
      !payload ||
      !payload.id ||
      !payload.fullName ||
      !payload.email
    ) {
      return res
        .status(400)
        .json({
          message: 'Incomplete registration data.',
        });
    }

    // Generate a secure QR token
    const qrToken = crypto.randomBytes(16).toString('hex');

    await registrationsCollection.insertOne({
      id: payload.id,

      qrToken,

      event: payload.event || '',

      fullName: payload.fullName || '',

      email: payload.email || '',

      phone: payload.phone || '',

      college: payload.college || '',

      department: payload.department || '',

      year: payload.year || '',

      foodPreference: payload.foodPreference || '',

      paperDomain:
        payload.paperDomain || '',

      paperTitle:
        payload.paperTitle || '',

      paperTeamSize:
        payload.paperTeamSize || '',

      transactionId:
        payload.transactionId || '',

      paymentFileName:
        payload.paymentFileName || '',

      timestamp:
        payload.timestamp ||
        new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'Registration saved successfully.',
      qrToken,
    });

  } catch (error) {
    console.error('Database error:', error);

    return res
      .status(500)
      .json({
        message: 'Failed to save registration.',
      });
  }
});

// --------------------
// Get registrations
// --------------------

app.get(
  '/api/registrations',
  requireAdmin,
  async (req, res) => {
    try {
      const rows =
        await registrationsCollection
          .find({})
          .sort({ timestamp: -1 })
          .toArray();

      res.json(rows);

    } catch (error) {
      console.error(
        'Fetch registrations error:',
        error
      );

      res
        .status(500)
        .json({
          message:
            'Failed to fetch registrations.',
        });
    }
  }
);

// --------------------
// Admin login
// --------------------

app.post(
  '/api/admin/login',
  adminLoginLimiter,
  (req, res) => {
  const email =
    typeof req.body?.email === 'string'
      ? req.body.email
      : '';

  const password =
    typeof req.body?.password === 'string'
      ? req.body.password
      : '';

  const expectedEmail =
    process.env.ADMIN_EMAIL || '';

  const expectedPassword =
    process.env.ADMIN_PASSWORD || '';

  if (!expectedEmail || !expectedPassword) {
    console.error(
      'Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.'
    );

    return res
      .status(500)
      .json({
        message:
          'Admin authentication is not configured.',
      });
  }

  if (
    email !== expectedEmail ||
    password !== expectedPassword
  ) {
    return res
      .status(401)
      .json({
        message:
          'Invalid admin email or password.',
      });
  }

  req.session.isAdminAuthenticated = true;
  req.session.adminEmail = email;

  return res.json({
    message: 'Login successful.',
  });
});

// --------------------
// Admin session
// --------------------

app.get('/api/admin/session', (req, res) => {
  return res.json({
    authenticated: Boolean(
      req.session.isAdminAuthenticated
    ),

    email:
      req.session.adminEmail || null,
  });
});

// --------------------
// Admin logout
// --------------------

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error(
        'Logout error:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Failed to log out.',
        });
    }

    return res.json({
      message:
        'Logged out successfully.',
    });
  });
});

// ==================================================
// COORDINATOR ATTENDANCE CHECK-IN
// ==================================================

app.post(
  '/api/attendance/check-in',
  requireAdmin,
  async (req, res) => {

    try {

      const qrToken =
        typeof req.body?.qrToken === 'string'
          ? req.body.qrToken.trim()
          : '';

      const event =
        typeof req.body?.event === 'string'
          ? req.body.event.trim()
          : '';

      // --------------------
      // Validate request
      // --------------------

      if (!qrToken || !event) {
        return res
          .status(400)
          .json({
            message:
              'QR token and event are required.',
          });
      }

      // --------------------
      // Find registration
      // --------------------

      let registration =
        await registrationsCollection.findOne({
          qrToken,
        });

      // --------------------
      // Legacy QR support
      // --------------------

      if (!registration) {

        try {

          const legacyData =
            JSON.parse(qrToken);

          if (legacyData?.id) {

            registration =
              await registrationsCollection.findOne({
                id: legacyData.id,
              });
          }

        } catch {
          // Not a legacy JSON QR
        }
      }

      // --------------------
      // Registration not found
      // --------------------

      if (!registration) {

        return res
          .status(404)
          .json({
            message:
              'Invalid QR code. Registration not found.',
          });
      }

      // --------------------
      // Check correct event
      // --------------------

      if (registration.event !== event) {

        return res
          .status(409)
          .json({
            message:
              `This QR belongs to ${
                registration.event ||
                'another event'
              }, not ${event}.`,

            registration: {
              fullName:
                registration.fullName,

              event:
                registration.event,
            },
          });
      }

      // --------------------
      // Check duplicate
      // --------------------

      if (
        registration.attendanceStatus ===
        'checked-in'
      ) {

        return res
          .status(409)
          .json({
            message:
              'This student has already been checked in.',

            alreadyCheckedIn: true,

            registration: {
              fullName:
                registration.fullName,

              college:
                registration.college,

              department:
                registration.department,

              year:
                registration.year,

              event:
                registration.event,

              checkInTime:
                registration.checkInTime ||
                null,
            },
          });
      }

      // --------------------
      // Attendance details
      // --------------------

      const checkInTime =
        new Date().toISOString();

      const checkedInBy =
        req.session.adminEmail ||
        'coordinator';

      // ==================================================
      // STEP 1
      // Update registration
      // ==================================================

      const updateResult =
        await registrationsCollection.updateOne(
          {
            _id: registration._id,

            // Important:
            // Only update if not already checked in.
            attendanceStatus: {
              $ne: 'checked-in',
            },
          },

          {
            $set: {
              attendanceStatus:
                'checked-in',

              checkInTime,

              checkedInBy,
            },
          }
        );

      // If another request checked the student
      // in at the same time, don't create another record.
      if (updateResult.modifiedCount === 0) {

        return res
          .status(409)
          .json({
            message:
              'This student has already been checked in.',
            alreadyCheckedIn: true,
          });
      }

      // ==================================================
      // STEP 2
      // Insert separate attendance record
      // ==================================================

      try {

        await attendanceCollection.insertOne({

          registrationId:
            registration.id,

          fullName:
            registration.fullName || '',

          email:
            registration.email || '',

          phone:
            registration.phone || '',

          college:
            registration.college || '',

          department:
            registration.department || '',

          year:
            registration.year || '',

          event:
            registration.event || '',

          checkInTime,

          checkedInBy,

          createdAt:
            new Date().toISOString(),
        });

      } catch (attendanceError) {

        console.error(
          'Attendance insert error:',
          attendanceError
        );

        // Roll back registration status if
        // attendance insertion fails.
        await registrationsCollection.updateOne(
          {
            _id: registration._id,
          },

          {
            $unset: {
              attendanceStatus: '',
              checkInTime: '',
              checkedInBy: '',
            },
          }
        );

        throw attendanceError;
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      console.log(
        `Attendance recorded: ${registration.fullName} - ${registration.event}`
      );

      return res.json({

        message:
          'Check-in successful.',

        registration: {

          id:
            registration.id,

          fullName:
            registration.fullName,

          college:
            registration.college,

          department:
            registration.department,

          year:
            registration.year,

          event:
            registration.event,

          checkInTime,

        },

      });

    } catch (error) {

      console.error(
        'Attendance check-in error:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Failed to record attendance.',
        });
    }
  }
);

// ==================================================
// GET ATTENDANCE RECORDS
// ==================================================

app.get(
  '/api/attendance',
  requireAdmin,
  async (req, res) => {

    try {

      const rows =
        await attendanceCollection
          .find({})
          .sort({
            checkInTime: -1,
          })
          .toArray();

      return res.json(rows);

    } catch (error) {

      console.error(
        'Fetch attendance error:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Failed to fetch attendance records.',
        });
    }
  }
);

// --------------------
// Delete registration
// --------------------

app.delete(
  '/api/registrations/:id',
  requireAdmin,
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const result =
        await registrationsCollection.deleteOne({
          id,
        });

      if (
        result.deletedCount === 0
      ) {

        return res
          .status(404)
          .json({
            message:
              'Registration not found.',
          });
      }

      return res.json({
        message:
          'Registration deleted successfully.',
      });

    } catch (error) {

      console.error(
        'Delete error:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Failed to delete registration.',
        });
    }
  }
);

// ==================================================
// START SERVER
// ==================================================

async function startServer() {

  try {

    await mongoClient.connect();

    const database =
      mongoClient.db(
        process.env.MONGODB_DB_NAME ||
          'springfest26'
      );

    registrationsCollection =
      database.collection(
        'registrations'
      );

    attendanceCollection =
      database.collection(
        'attendance'
      );

    // --------------------
    // QR token index
    // --------------------

    await registrationsCollection.createIndex(
      { qrToken: 1 },

      {
        unique: true,

        partialFilterExpression: {
          qrToken: {
            $exists: true,
          },
        },
      }
    );

    // --------------------
    // Attendance index
    // --------------------
    // Prevents the same registration
    // from being stored twice for the same event.

    await attendanceCollection.createIndex(
      {
        registrationId: 1,
        event: 1,
      },

      {
        unique: true,
      }
    );

    console.log(
      'Connected to MongoDB Atlas.'
    );

    console.log(
      'Attendance collection ready.'
    );
    // ==================================================
// PRODUCTION FRONTEND
// ==================================================

if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(
    __dirname,
    'client',
    'dist'
  );

  app.use(
    express.static(clientDistPath)
  );

  app.use((req, res, next) => {
  if (
    req.method !== 'GET' ||
    req.path.startsWith('/api') ||
    req.path.startsWith('/assets/')
  ) {
    return next();
  }

  res.sendFile(
    path.join(
      clientDistPath,
      'index.html'
    )
  );
});
}
    app.listen(port, () => {

      console.log(
        `Server running on http://localhost:${port}`
      );

    });

  } catch (error) {

    console.error(
      'Failed to connect to MongoDB:',
      error
    );

    process.exit(1);
  }
}

startServer();
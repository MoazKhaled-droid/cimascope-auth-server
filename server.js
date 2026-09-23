const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// CORS - React deployed on Vercel
app.use(
  cors({
    origin: [
      "https://cimascope-xi.vercel.app",
      "https://brain-wave-quiz-app.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// قاعدة بيانات وهمية فيها اليوزر
let users = [
  {
    id: 1,
    username: "moaz khaled",
    email: "moaz@cimascope.com",
    password: "123456",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    favorites: [],
    watchlist: [],
  },
];

let activeTokens = new Set();

// 1. LOGIN
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password!",
    });
  }

  const tokenValue = `tmsa7-cookie-token-${user.id}-${Date.now()}`;

  activeTokens.add(tokenValue);

  res.cookie("auth_token", tokenValue, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: "Logged in successfully",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

// 2. AUTH/ME
app.get("/api/auth/me", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No valid session",
    });
  }

  res.json({
    success: true,
    user: {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      avatar: users[0].avatar,
    },
  });
});

// 3. LOGOUT
app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies.auth_token;

  if (token) {
    activeTokens.delete(token);
  }

  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Auth Server is running on port ${PORT}`);
});
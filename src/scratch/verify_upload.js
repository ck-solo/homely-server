import mongoose from "mongoose";
import dotenv from "dotenv";
import DatabaseConfig from "../config/db.config.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { createListing } from "../controllers/listing.controller.js";

dotenv.config();

async function runVerification() {
  console.log("Connecting to database...");
  await DatabaseConfig.connect();

  try {
    // 1. Retrieve an existing OWNER from database, or create a mock owner
    console.log("Finding an owner...");
    let owner = await User.findOne({ role: "OWNER" });
    if (!owner) {
      console.log("No owner found, creating a mock owner...");
      owner = new User({
        name: "S3 Verifier Owner",
        email: `s3_owner_${Date.now()}@example.com`,
        password: "Password123",
        phone: "9876543210",
        role: "OWNER",
      });
      await owner.save();
    }
    console.log("Owner found/created. ID:", owner._id);

    // 2. Prepare mock request with mock file buffers (1x1 transparent pixel GIF/JPG content)
    const mockFiles = [
      {
        fieldname: "images",
        originalname: "room1.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from(
          "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
          "base64"
        ),
        size: 100,
      },
      {
        fieldname: "images",
        originalname: "room2.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from(
          "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
          "base64"
        ),
        size: 100,
      },
    ];

    const req = {
      user: {
        id: owner._id,
        email: owner.email,
        role: owner.role,
      },
      files: mockFiles,
      body: {
        title: "Test S3 Property Listing",
        description: "Verify AWS S3 Image Upload flow is correct.",
        city: "Bangalore",
        rentBudget: "15000",
        propertyType: "Flat",
        genderPreference: "Co-ed",
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716],
          address: "Bangalore City, Karnataka",
        },
        amenities: ["WiFi", "AC", "Power Backup"],
      },
    };

    console.log("\nMocking createListing route request...");
    console.log("Route: POST /api/v1/listings");
    console.log("Role: OWNER");

    // 3. Mock Express Response
    const res = {
      statusCode: 200,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        console.log("\n=== POSTMAN RESPONSE RECEIVED ===");
        console.log("Status Code:", this.statusCode);
        console.log("Response Body:", JSON.stringify(data, null, 2));
        
        // After receiving successful response, fetch the document from DB to verify
        if (data.success && data.data && data.data._id) {
          verifyDatabaseDocument(data.data._id);
        } else {
          finish();
        }
      },
    };

    const next = (err) => {
      console.error("\n=== NEXT ERROR HANDLER TRIGGERED ===");
      console.error(err);
      finish();
    };

    // Run the controller!
    await createListing(req, res, next);

  } catch (err) {
    console.error("Execution error:", err);
    finish();
  }
}

async function verifyDatabaseDocument(listingId) {
  try {
    console.log("\nVerifying database document...");
    const doc = await Listing.findById(listingId);
    console.log("=== MongoDB Document ===");
    console.log(JSON.stringify(doc, null, 2));
    
    // Check S3 URLs accessibility
    if (doc && doc.images && doc.images.length > 0) {
      console.log("\n=== Checking S3 Image URL Accessibility ===");
      for (const url of doc.images) {
        console.log("Testing URL:", url);
        try {
          const fetchResponse = await fetch(url);
          console.log(`URL Status: ${fetchResponse.status} ${fetchResponse.statusText}`);
          if (fetchResponse.ok) {
            console.log(`Image accessible!`);
          } else {
            console.warn(`Warning: Image request failed.`);
          }
        } catch (fetchErr) {
          console.error(`Failed to fetch S3 URL:`, fetchErr.message);
        }
      }
    }
  } catch (err) {
    console.error("Database query failed:", err);
  } finally {
    finish();
  }
}

function finish() {
  console.log("\nDisconnecting DB and exiting...");
  mongoose.connection.close();
  process.exit(0);
}

runVerification();

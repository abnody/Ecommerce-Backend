/**
 * Middleware to sanitize sensitive data from response objects
 * 
 * PROTECTED FIELDS & RATIONALE:
 * 
 * 1. password - CRITICAL: Never expose hashed passwords
 * 2. passwordResetCode - CRITICAL: Security token for password reset
 * 3. passwordResetExpires - HIGH: Security timing information
 * 4. verificationCode - CRITICAL: Email verification token
 * 5. verificationCodeExpires - HIGH: Security timing information
 * 6. passwordChangedAt - MEDIUM: Token invalidation logic
 * 7. resetverified - MEDIUM: Internal security state
 * 8. __v - LOW: MongoDB version key
 * 9. _id - LOW: Use uuid instead
 */

const sanitizeResponse = (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override res.json to sanitize before sending
    res.json = function(data) {
        // Recursively sanitize the data
        const sanitized = sanitizeData(data);
        return originalJson(sanitized);
    };

    next();
};

/**
 * Fields to remove from all responses
 */
const sensitiveFields = [
    'password',
    'passwordResetCode',
    'passwordResetExpires',
    'verificationCode',
    'verificationCodeExpires',
    'passwordChangedAt',
    'resetverified',
    '__v',
    '_id'
];

/**
 * Mongoose internal fields to remove
 */
const mongooseInternalFields = [
    '$__',
    '$isNew',
    '_doc'
];

/**
 * Clean a single user/document object
 */
const cleanObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle Mongoose documents - extract _doc first
    let cleaned;
    if (obj._doc) {
        // This is a Mongoose document, use _doc
        cleaned = { ...obj._doc };
    } else if (obj.toObject && typeof obj.toObject === 'function') {
        // Alternative: use toObject() method
        cleaned = obj.toObject();
    } else {
        // Regular object
        cleaned = { ...obj };
    }

    // Remove sensitive fields
    sensitiveFields.forEach(field => {
        delete cleaned[field];
    });

    // Remove Mongoose internal fields
    mongooseInternalFields.forEach(field => {
        delete cleaned[field];
    });

    // Recursively clean nested objects
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] && typeof cleaned[key] === 'object') {
            if (Array.isArray(cleaned[key])) {
                cleaned[key] = cleaned[key].map(item => cleanObject(item));
            } else if (cleaned[key] instanceof Date) {
                // Keep dates as-is
                cleaned[key] = cleaned[key];
            } else {
                cleaned[key] = cleanObject(cleaned[key]);
            }
        }
    });

    return cleaned;
};

/**
 * Recursively sanitize data structure
 */
const sanitizeData = (data) => {
    if (!data) return data;

    // Handle the response wrapper structure
    if (data.success !== undefined) {
        const sanitized = { ...data };

        // Clean the data field if it exists
        if (sanitized.data) {
            if (Array.isArray(sanitized.data)) {
                sanitized.data = sanitized.data.map(item => cleanObject(item));
            } else {
                sanitized.data = cleanObject(sanitized.data);
            }
        }

        // Clean any user field if it exists
        if (sanitized.user) {
            sanitized.user = cleanObject(sanitized.user);
        }

        return sanitized;
    }

    // Handle arrays directly
    if (Array.isArray(data)) {
        return data.map(item => cleanObject(item));
    }

    // Handle single object
    return cleanObject(data);
};

/**
 * Alternative: Use as Mongoose schema method (add to user.js)
 * This approach is cleaner and more efficient
 */
const setupUserTransform = (userSchema) => {
    // Override toJSON to automatically clean when converting to JSON
    userSchema.set('toJSON', {
        transform: function(doc, ret, options) {
            // Remove sensitive fields
            delete ret.password;
            delete ret.passwordResetCode;
            delete ret.passwordResetExpires;
            delete ret.verificationCode;
            delete ret.verificationCodeExpires;
            delete ret.passwordChangedAt;
            delete ret.resetverified;
            delete ret.__v;
            delete ret._id;

            return ret;
        }
    });

    // Also override toObject for consistency
    userSchema.set('toObject', {
        transform: function(doc, ret, options) {
            delete ret.password;
            delete ret.passwordResetCode;
            delete ret.passwordResetExpires;
            delete ret.verificationCode;
            delete ret.verificationCodeExpires;
            delete ret.passwordChangedAt;
            delete ret.resetverified;
            delete ret.__v;
            delete ret._id;

            return ret;
        }
    });
};

module.exports = {
    sanitizeResponse,
    setupUserTransform
};
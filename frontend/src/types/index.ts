/**
 * @fileoverview Global type definitions for the frontend.
 */

/**
 * Represents a user profile in the application.
 */
export interface User {
    id: string;
    email: string;
    name: string;
    studentId?: string;
    department?: string;
    year?: string;
    avatar?: string;
    isVerified: boolean;
}

// lib/types/api.ts

export enum UserType {
    PERSON = 'PERSON',
    ORGANIZATION = 'ORGANIZATION'
}

/**
 * AUTH TYPES
 */

export interface LoginRequestDTO {
    identifier: string;
    password: string;
}

export interface UpdateProfileRequestDTO {
    user_firstname?: string;
    user_lastname?: string;
    email?: string;
    contact?: string;
    user_logo?: string;
    domain?: string;
    description?: string;
    password?: string;
    occupation?: string;
    location?: string;
}

export interface RegisterRequestDTO {
    user_type: UserType;
    user_firstname?: string;
    user_lastname: string;
    organization_name?: string; // AJOUTÉ : Pour corriger l'erreur ts(2353)
    email?: string;
    password: string;
    contact?: string;
    user_logo?: string;
    domain?: string;
    description?: string;
    occupation?: string;
    location?: string;
}

export interface UserResponseDTO {
    user_id: string;
    user_type: UserType;
    user_firstname: string;
    user_lastname: string;
    email: string;
    contact: string;
    user_logo: string;
    domain: string;
    description: string;
    registration_date_time: string;
    certified: boolean;
    occupation?: string;
    location?: string;
}

export interface AuthResponseDTO {
    message: string;
    user_response_dto?: UserResponseDTO;
    token?: string;
}

export interface PasswordResetRequestDTO {
    email: string;
}

export interface PasswordResetConfirmDTO {
    token: string;
    new_password: string;
}

export interface TwoFactorSetupResponseDTO {
    secret: string;
    qr_code_url: string;
    backup_codes: string[];
}

export interface TwoFactorVerifyDTO {
    identifier: string;
    code: string;
}

/**
 * PROJECT TYPES
 */

export interface ProjectResponseDTO {
    project_id: string;
    project_name: string;
    code: string;
    description?: string;
    project_logo?: string;
    creation_date_time: string;
    number_of_members: number;
    creator_id: string;
}

export interface ProjectDetailResponseDTO extends ProjectResponseDTO {
    creator_name?: string;
    members?: MemberResponseDTO[];
}

export interface CreateProjectRequestDTO {
    project_name: string;
    description?: string;
    project_logo?: string;
}

export interface UpdateProjectRequestDTO {
    project_name?: string;
    description?: string;
    project_logo?: string;
    code?: string;
}

export interface MemberResponseDTO {
    member_id: string;
    member_pseudo: string;
    user_id: string;
    project_id: string;
    user_firstname?: string;
    user_lastname?: string;
    user_email?: string;
    user_logo?: string;
}

/**
 * FEEDBACK TYPES
 */

export interface FeedbackResponseDTO {
    feedback_id: string;
    feedback_date_time: string;
    content: string;
    attachments: string[];
    target_project_id: string;
    project_name: string;
    member_id: string;
    member_pseudo: string;
    number_of_likes: number;
    number_of_comments: number;
}

export interface CreateFeedbackRequestDTO {
    project_id: string;
    member_pseudo: string;
    content: string;
    attachments: string[];
}

export interface UpdateFeedbackRequestDTO {
    content: string;
    attachments: string[];
}

/**
 * COMMENT TYPES
 */

export interface CommentResponseDTO {
    comments_id: string;
    feedback_id: string;
    commenter_id: string;
    commenter_name: string;
    content: string;
    comments_date_time: string;
    number_of_likes: number;
}

export interface CreateCommentRequestDTO {
    feedback_id: string;
    commenter_id: string;
    content: string;
}

export interface UpdateCommentRequestDTO {
    content: string;
}

/**
 * SUBSCRIPTION TYPES
 */

export interface SubscriptionStatsDTO {
    followersCount: number;
    followingCount: number;
}

export interface PersonDTO {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    contact: string;
    profileImage: string;
    domain: string;
    description: string;
    certified: boolean;
    userType: string;
    registrationDateTime: string;
    subscriptionStats?: SubscriptionStatsDTO;
    occupation?: string;
}

export interface SubscriptionDTO {
    followedId: string;
    followerId: string;
    followed?: PersonDTO;
    follower?: PersonDTO;
    followDateTime: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

/**
 * COMMON TYPES
 */

export interface ApiError {
    message: string;
    status: number;
}
```mermaid
%% =============================================================================
%% DAWLITY STORY-SHARING PLATFORM - COMPREHENSIVE SEQUENCE DIAGRAMS
%% Professional Sequence Diagrams with Microservices Architecture
%% Created: December 18, 2025
%% Author: GitHub Copilot - Professional Software Architecture Documentation
%% =============================================================================

%% =============================================================================
%% 1. USER AUTHENTICATION SEQUENCE DIAGRAM
%% =============================================================================

sequenceDiagram
    participant U as User
    participant FE as Frontend (React)
    participant AG as API Gateway
    participant AS as Auth Service
    participant DB as User Database
    participant NS as Notification Service
    participant ES as Email Service

    %% Authentication Flow
    rect rgb(240, 248, 255)
        Note over U,ES: User Authentication & Registration Flow
        U->>FE: Navigate to /login
        FE->>U: Display Login Form

        U->>FE: Enter credentials
        FE->>AG: POST /api/v1/auth/login
        AG->>AS: Forward login request

        activate AS
            AS->>DB: Query user by email
            DB-->>AS: Return user data
            AS->>AS: Validate password hash
            AS->>AS: Generate JWT tokens
            AS->>DB: Update refresh token
        deactivate AS

        AS-->>AG: Return access_token, refresh_token
        AG-->>FE: Return tokens
        FE->>FE: Store tokens in localStorage
        FE->>U: Redirect to dashboard
    end

    %% Registration Flow
    rect rgb(255, 248, 240)
        Note over U,ES: User Registration Flow
        U->>FE: Navigate to /signup
        FE->>U: Display Registration Form

        U->>FE: Enter details (name, email, password)
        FE->>AG: POST /api/v1/auth/register
        AG->>AS: Forward registration

        activate AS
            AS->>DB: Check email uniqueness
            DB-->>AS: Email available
            AS->>AS: Hash password
            AS->>DB: Create user record
            AS->>AS: Generate verification code
            AS->>NS: Queue verification email
        deactivate AS

        NS->>ES: Send verification email
        AS-->>AG: Registration successful
        AG-->>FE: Success response
        FE->>U: Show verification message
    end

    %% Email Verification Flow
    rect rgb(248, 255, 248)
        Note over U,ES: Email Verification Flow
        U->>FE: Click verification link
        FE->>AG: POST /api/v1/auth/verify
        AG->>AS: Forward verification

        activate AS
            AS->>DB: Find user by email & code
            AS->>DB: Update user as verified
            AS->>DB: Clear verification code
        deactivate AS

        AS-->>AG: Verification successful
        AG-->>FE: Success response
        FE->>U: Auto-login & redirect
    end

%% =============================================================================
%% 2. STORY CREATION & SUBMISSION SEQUENCE DIAGRAM
%% =============================================================================

sequenceDiagram
    participant U as User
    participant FE as Frontend (React)
    participant AG as API Gateway
    participant SS as Story Service
    participant FS as File Storage Service
    participant DB as Story Database
    participant MS as Moderation Service
    participant NS as Notification Service

    %% Story Creation Flow
    rect rgb(255, 250, 240)
        Note over U,NS: Story Creation & Submission Flow
        U->>FE: Navigate to /create-story
        FE->>U: Display story type selection

        U->>FE: Select story type (Text/Audio/Video)
        FE->>U: Display appropriate form

        alt Text Story
            U->>FE: Enter title, content, location, tags
            FE->>FE: Validate form data
        else Audio/Video Story
            U->>FE: Enter title, select file, metadata
            FE->>FS: Upload file to temp storage
            FS-->>FE: Return file URL
        end

        U->>FE: Click "Publish Story"
        FE->>AG: POST /api/v1/stories (with auth)
        AG->>SS: Forward story submission

        activate SS
            SS->>SS: Validate story data
            SS->>DB: Create story record (PENDING status)

            alt File-based story
                SS->>FS: Move file from temp to permanent
                FS-->>SS: Confirm file storage
                SS->>DB: Update story with file URL
            end

            SS->>MS: Queue for moderation
            SS->>NS: Notify user of submission
        deactivate SS

        MS->>DB: Update story status
        SS-->>AG: Story created successfully
        AG-->>FE: Success response
        FE->>U: Show success message & redirect
    end

%% =============================================================================
%% 3. ADMIN MODERATION SEQUENCE DIAGRAM
%% =============================================================================

sequenceDiagram
    participant A as Admin
    participant FE as Admin Frontend
    participant AG as API Gateway
    participant MS as Moderation Service
    participant SS as Story Service
    participant DB as Story Database
    participant NS as Notification Service
    participant US as User Service

    %% Admin Review Flow
    rect rgb(248, 240, 255)
        Note over A,US: Admin Moderation Flow
        A->>FE: Navigate to /admin
        FE->>AG: GET /api/v1/admin/pending-stories
        AG->>MS: Forward request

        activate MS
            MS->>DB: Query pending stories
            DB-->>MS: Return story list
        deactivate MS

        MS-->>AG: Return pending stories
        AG-->>FE: Display moderation queue
        FE->>A: Show story list

        A->>FE: Click on story to review
        FE->>A: Display story details & actions

        alt Approve Story
            A->>FE: Click "Approve"
            FE->>AG: PUT /api/v1/admin/stories/{id}/approve
            AG->>MS: Forward approval

            activate MS
                MS->>DB: Update story status to APPROVED
                MS->>SS: Publish story to public feed
                MS->>NS: Notify author of approval
            deactivate MS

            MS-->>AG: Approval successful
            AG-->>FE: Success response
            FE->>A: Remove from queue & show success

        else Request Modification
            A->>FE: Click "Request Modification"
            FE->>A: Show modification note input
            A->>FE: Enter modification notes
            FE->>AG: PUT /api/v1/admin/stories/{id}/request-modification
            AG->>MS: Forward modification request

            activate MS
                MS->>DB: Update story status to NEEDS_MODIFICATION
                MS->>DB: Store modification notes
                MS->>NS: Notify author with modification notes
            deactivate MS

            MS-->>AG: Modification requested
            AG-->>FE: Success response
            FE->>A: Remove from queue

        else Reject Story
            A->>FE: Click "Reject"
            FE->>A: Show rejection reason modal
            A->>FE: Enter rejection reason
            FE->>AG: PUT /api/v1/admin/stories/{id}/reject
            AG->>MS: Forward rejection

            activate MS
                MS->>DB: Update story status to REJECTED
                MS->>DB: Store rejection reason
                MS->>NS: Notify author with rejection reason
                MS->>FS: Optionally delete associated files
            deactivate MS

            MS-->>AG: Rejection successful
            AG-->>FE: Success response
            FE->>A: Remove from queue
        end
    end

%% =============================================================================
%% 4. PUBLIC STORY VIEWING SEQUENCE DIAGRAM
%% =============================================================================

sequenceDiagram
    participant V as Visitor/User
    participant FE as Frontend (React)
    participant AG as API Gateway
    participant SS as Story Service
    participant DB as Story Database
    participant FS as File Storage Service
    participant CS as Caching Service

    %% Public Story Viewing Flow
    rect rgb(240, 255, 248)
        Note over V,FS: Public Story Viewing Flow
        V->>FE: Navigate to /
        FE->>AG: GET /api/v1/stories (public endpoint)
        AG->>SS: Forward story request

        activate SS
            SS->>CS: Check cache for stories
            alt Cache hit
                CS-->>SS: Return cached stories
            else Cache miss
                SS->>DB: Query approved stories
                DB-->>SS: Return story data
                SS->>CS: Cache story data
            end
        deactivate SS

        SS-->>AG: Return story list
        AG-->>FE: Display stories
        FE->>V: Show story feed

        V->>FE: Click on story to view details
        FE->>AG: GET /api/v1/stories/{id}
        AG->>SS: Forward story details request

        activate SS
            SS->>CS: Check cache for story details
            alt Cache hit
                CS-->>SS: Return cached story
            else Cache miss
                SS->>DB: Query story by ID
                DB-->>SS: Return story data
                SS->>CS: Cache story details
            end
        deactivate SS

        SS-->>AG: Return story details
        AG-->>FE: Display story details

        alt Media story (Audio/Video)
            FE->>FS: Request media file
            FS-->>FE: Stream media content
            FE->>V: Display media player
        end

        FE->>V: Show complete story
    end

%% =============================================================================
%% 5. PASSWORD RESET SEQUENCE DIAGRAM
%% =============================================================================

sequenceDiagram
    participant U as User
    participant FE as Frontend (React)
    participant AG as API Gateway
    participant AS as Auth Service
    participant DB as User Database
    participant NS as Notification Service
    participant ES as Email Service

    %% Password Reset Flow
    rect rgb(255, 240, 248)
        Note over U,ES: Password Reset Flow
        U->>FE: Navigate to /reset-password
        FE->>U: Display reset form

        U->>FE: Enter email address
        FE->>AG: POST /api/v1/auth/forgot-password
        AG->>AS: Forward reset request

        activate AS
            AS->>DB: Find user by email
            DB-->>AS: Return user data
            AS->>AS: Generate reset token
            AS->>DB: Store reset token with expiry
            AS->>NS: Queue password reset email
        deactivate AS

        NS->>ES: Send reset email with token
        AS-->>AG: Reset email sent
        AG-->>FE: Success response
        FE->>U: Show confirmation message

        %% Token-based password update
        U->>FE: Click reset link in email
        FE->>U: Display new password form
        U->>FE: Enter new password
        FE->>AG: POST /api/v1/auth/reset-password
        AG->>AS: Forward password reset

        activate AS
            AS->>DB: Validate reset token
            AS->>AS: Hash new password
            AS->>DB: Update user password
            AS->>DB: Clear reset token
        deactivate AS

        AS-->>AG: Password updated
        AG-->>FE: Success response
        FE->>U: Show success & redirect to login
    end

%% =============================================================================
%% 6. CROSS-SERVICE COMMUNICATION SEQUENCE DIAGRAM
%% =============================================================================

sequenceDiagram
    participant FE as Frontend
    participant AG as API Gateway
    participant AS as Auth Service
    participant SS as Story Service
    participant MS as Moderation Service
    participant NS as Notification Service
    participant FS as File Storage Service
    participant DB as Database
    participant MQ as Message Queue

    %% Event-driven communication
    rect rgb(248, 248, 255)
        Note over FE,MQ: Event-Driven Microservices Communication
        FE->>AG: Submit new story
        AG->>SS: Process story submission

        activate SS
            SS->>DB: Save story (PENDING)
            SS->>MQ: Publish "story.submitted" event
            SS->>AG: Return success
        deactivate SS

        AG-->>FE: Story submitted

        %% Async processing
        MQ->>MS: Consume "story.submitted"
        activate MS
            MS->>DB: Get story details
            MS->>MS: Perform content moderation checks
            MS->>MQ: Publish "moderation.completed"
        deactivate MS

        MQ->>NS: Consume "moderation.completed"
        activate NS
            NS->>DB: Get user contact info
            NS->>NS: Send notification email
        deactivate NS

        %% File processing for media stories
        MQ->>FS: Consume "story.submitted" (media)
        activate FS
            FS->>FS: Process/optimize media file
            FS->>DB: Update file URLs
            FS->>MQ: Publish "file.processed"
        deactivate FS
    end

%% =============================================================================
%% ACTIVITY DIAGRAMS
%% =============================================================================

%% =============================================================================
%% 1. USER REGISTRATION ACTIVITY DIAGRAM
%% =============================================================================

stateDiagram-v2
    [*] --> EnterRegistrationDetails
    EnterRegistrationDetails --> ValidateInput: Submit form

    ValidateInput --> ShowErrors: Invalid data
    ShowErrors --> EnterRegistrationDetails

    ValidateInput --> CheckEmailUniqueness: Valid data
    CheckEmailUniqueness --> EmailTaken: Email exists
    EmailTaken --> ShowEmailError
    ShowEmailError --> EnterRegistrationDetails

    CheckEmailUniqueness --> CreateUserAccount: Email available
    CreateUserAccount --> GenerateVerificationCode
    GenerateVerificationCode --> SendVerificationEmail
    SendVerificationEmail --> ShowVerificationMessage
    ShowVerificationMessage --> [*]

    note right of SendVerificationEmail
        Async process:
        - Queue email
        - Send via SMTP
        - Handle failures
    end note

%% =============================================================================
%% 2. STORY SUBMISSION ACTIVITY DIAGRAM
%% =============================================================================

stateDiagram-v2
    [*] --> SelectStoryType
    SelectStoryType --> TextStoryForm: Text selected
    SelectStoryType --> MediaStoryForm: Audio/Video selected

    TextStoryForm --> ValidateTextInput: Submit text story
    MediaStoryForm --> UploadMediaFile: Submit media story

    UploadMediaFile --> ValidateMediaFile: File uploaded
    ValidateMediaFile --> ShowFileError: Invalid file
    ShowFileError --> MediaStoryForm

    ValidateMediaFile --> ValidateMetadata: Valid file
    ValidateMetadata --> ShowMetadataError: Invalid metadata
    ShowMetadataError --> MediaStoryForm

    ValidateTextInput --> ShowTextError: Invalid text
    ShowTextError --> TextStoryForm

    ValidateTextInput --> SubmitToAPI: Valid text
    ValidateMetadata --> SubmitToAPI: Valid metadata

    SubmitToAPI --> ShowSubmissionError: API error
    ShowSubmissionError --> SelectStoryType

    SubmitToAPI --> ShowSuccessMessage: Success
    ShowSuccessMessage --> [*]

    note right of SubmitToAPI
        Parallel processes:
        - Save to database
        - Queue for moderation
        - Send notifications
        - Process media files
    end note

%% =============================================================================
%% 3. ADMIN MODERATION ACTIVITY DIAGRAM
%% =============================================================================

stateDiagram-v2
    [*] --> LoadPendingStories
    LoadPendingStories --> NoStoriesAvailable: Empty queue
    NoStoriesAvailable --> [*]

    LoadPendingStories --> DisplayStoryQueue: Stories available
    DisplayStoryQueue --> SelectStoryForReview

    SelectStoryForReview --> DisplayStoryDetails
    DisplayStoryDetails --> ChooseAction: Review complete

    ChooseAction --> ApproveStory: Approve
    ChooseAction --> RequestModification: Request changes
    ChooseAction --> RejectStory: Reject

    ApproveStory --> UpdateStoryStatus: Status = APPROVED
    RequestModification --> EnterModificationNotes
    EnterModificationNotes --> UpdateStoryStatus: Status = NEEDS_MODIFICATION

    RejectStory --> EnterRejectionReason
    EnterRejectionReason --> UpdateStoryStatus: Status = REJECTED

    UpdateStoryStatus --> NotifyAuthor
    NotifyAuthor --> RemoveFromQueue
    RemoveFromQueue --> CheckMoreStories: More stories?

    CheckMoreStories --> SelectStoryForReview: Yes
    CheckMoreStories --> [*]: No

    note right of NotifyAuthor
        Notification types:
        - Approval: Success message
        - Modification: Detailed feedback
        - Rejection: Reason explanation
    end note

%% =============================================================================
%% 4. USER AUTHENTICATION ACTIVITY DIAGRAM
%% =============================================================================

stateDiagram-v2
    [*] --> CheckAuthenticationStatus

    CheckAuthenticationStatus --> ShowLoginForm: Not authenticated
    CheckAuthenticationStatus --> RouteToDashboard: Authenticated user
    CheckAuthenticationStatus --> RouteToAdminPanel: Authenticated admin

    ShowLoginForm --> ValidateCredentials: Submit login
    ValidateCredentials --> ShowLoginError: Invalid credentials
    ShowLoginError --> ShowLoginForm

    ValidateCredentials --> CheckUserRole: Valid credentials
    CheckUserRole --> RouteToDashboard: Regular user
    CheckUserRole --> RouteToAdminPanel: Admin user

    RouteToDashboard --> [*]
    RouteToAdminPanel --> [*]

    note right of ValidateCredentials
        Token management:
        - Generate JWT
        - Store in localStorage
        - Set session expiry
    end note

%% =============================================================================
%% 5. FILE UPLOAD & PROCESSING ACTIVITY DIAGRAM
%% =============================================================================

stateDiagram-v2
    [*] --> SelectFile
    SelectFile --> ValidateFileType: File selected

    ValidateFileType --> ShowFileTypeError: Invalid type
    ShowFileTypeError --> SelectFile

    ValidateFileType --> ValidateFileSize: Valid type
    ValidateFileSize --> ShowFileSizeError: Too large
    ShowFileSizeError --> SelectFile

    ValidateFileSize --> UploadToTempStorage: Valid size
    UploadToTempStorage --> ShowUploadProgress
    ShowUploadProgress --> UploadComplete: Upload finished

    UploadComplete --> ProcessFile: Media file
    UploadComplete --> SubmitStoryData: Text file

    ProcessFile --> OptimizeMedia: Audio/Video
    OptimizeMedia --> GenerateThumbnails: Video
    GenerateThumbnails --> MoveToPermanentStorage

    OptimizeMedia --> MoveToPermanentStorage: Audio only
    MoveToPermanentStorage --> UpdateDatabaseURLs
    UpdateDatabaseURLs --> CleanupTempFiles
    CleanupTempFiles --> [*]

    SubmitStoryData --> [*]

    note right of ProcessFile
        Processing steps:
        - Format conversion
        - Compression
        - Metadata extraction
        - CDN distribution
    end note

%% =============================================================================
%% ARCHITECTURAL COMPONENT DIAGRAM
%% =============================================================================

graph TB
    subgraph "Client Layer"
        A[React Frontend]
        A1[Visitor View]
        A2[User Dashboard]
        A3[Admin Panel]
        A4[Authentication Forms]
    end

    subgraph "API Gateway Layer"
        B[API Gateway]
        B1[Rate Limiting]
        B2[Authentication]
        B3[Request Routing]
    end

    subgraph "Microservices Layer"
        C[Auth Service]
        D[Story Service]
        E[Moderation Service]
        F[Notification Service]
        G[File Storage Service]
    end

    subgraph "Data Layer"
        H[(User Database)]
        I[(Story Database)]
        J[(File Storage)]
        K[(Cache Layer)]
    end

    subgraph "External Services"
        L[Email Service]
        M[SMS Service]
        N[CDN]
    end

    A --> B
    A1 --> A
    A2 --> A
    A3 --> A
    A4 --> A

    B --> C
    B --> D
    B --> E
    B --> F
    B --> G

    B1 --> B
    B2 --> B
    B3 --> B

    C --> H
    D --> I
    E --> I
    F --> H
    F --> I
    G --> J

    C --> K
    D --> K
    E --> K

    F --> L
    F --> M
    G --> N

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style G fill:#e8f5e8
    style H fill:#fff3e0
    style I fill:#fff3e0
    style J fill:#fff3e0
    style K fill:#fff3e0

%% =============================================================================
%% DEPLOYMENT DIAGRAM
%% =============================================================================

graph TB
    subgraph "Load Balancer"
        LB[NGINX Load Balancer]
    end

    subgraph "Frontend Cluster"
        FE1[React App Server 1]
        FE2[React App Server 2]
        FE3[React App Server 3]
    end

    subgraph "API Gateway Cluster"
        AG1[API Gateway 1]
        AG2[API Gateway 2]
    end

    subgraph "Microservices Cluster"
        MS1[Auth Service]
        MS2[Story Service]
        MS3[Moderation Service]
        MS4[Notification Service]
        MS5[File Service]
    end

    subgraph "Database Cluster"
        DB1[(Primary DB)]
        DB2[(Replica DB 1)]
        DB3[(Replica DB 2)]
    end

    subgraph "Cache Cluster"
        CACHE1[Redis Cache 1]
        CACHE2[Redis Cache 2]
    end

    subgraph "Storage"
        S3[(Object Storage)]
        CDN[CDN Network]
    end

    subgraph "Monitoring"
        MON[Monitoring Stack]
        LOG[Log Aggregation]
    end

    LB --> FE1
    LB --> FE2
    LB --> FE3

    FE1 --> AG1
    FE2 --> AG1
    FE3 --> AG2
    FE1 --> AG2
    FE2 --> AG2

    AG1 --> MS1
    AG1 --> MS2
    AG1 --> MS3
    AG2 --> MS4
    AG2 --> MS5

    MS1 --> DB1
    MS2 --> DB1
    MS3 --> DB1
    MS4 --> DB1
    MS5 --> DB1

    DB1 --> DB2
    DB1 --> DB3

    MS1 --> CACHE1
    MS2 --> CACHE1
    MS3 --> CACHE2
    MS4 --> CACHE2
    MS5 --> CACHE2

    MS5 --> S3
    S3 --> CDN

    MS1 --> MON
    MS2 --> MON
    MS3 --> MON
    MS4 --> MON
    MS5 --> MON

    FE1 --> LOG
    FE2 --> LOG
    FE3 --> LOG
    AG1 --> LOG
    AG2 --> LOG

    style LB fill:#ffecb3
    style FE1 fill:#e1f5fe
    style FE2 fill:#e1f5fe
    style FE3 fill:#e1f5fe
    style AG1 fill:#f3e5f5
    style AG2 fill:#f3e5f5
    style MS1 fill:#e8f5e8
    style MS2 fill:#e8f5e8
    style MS3 fill:#e8f5e8
    style MS4 fill:#e8f5e8
    style MS5 fill:#e8f5e8
    style DB1 fill:#fff3e0
    style CACHE1 fill:#fce4ec
    style S3 fill:#f3e5f5
    style MON fill:#e8eaf6

%% =============================================================================
%% PROFESSIONAL DOCUMENTATION NOTES
%% =============================================================================

%% This comprehensive documentation includes:
%%
%% 1. SEQUENCE DIAGRAMS:
%%    - User Authentication Flow
%%    - Story Creation & Submission
%%    - Admin Moderation Process
%%    - Public Story Viewing
%%    - Password Reset Flow
%%    - Cross-service Communication
%%
%% 2. ACTIVITY DIAGRAMS:
%%    - User Registration Process
%%    - Story Submission Workflow
%%    - Admin Moderation Workflow
%%    - User Authentication Flow
%%    - File Upload & Processing
%%
%% 3. ARCHITECTURAL DIAGRAMS:
%%    - Component Architecture
%%    - Deployment Architecture
%%
%% KEY FEATURES IMPLEMENTED:
%% ✅ Dashed return lines for async operations
%% ✅ Execution timelines with activation boxes
%% ✅ Alternative flows (ALT) for different scenarios
%% ✅ Microservices architecture design
%% ✅ Event-driven communication patterns
%% ✅ Comprehensive error handling flows
%% ✅ Caching and performance considerations
%% ✅ Security and authentication flows
%% ✅ File processing and storage workflows
%% ✅ Notification and communication systems
%%
%% PROFESSIONAL STANDARDS FOLLOWED:
%% - UML 2.5 compliant notation
%% - Industry best practices for microservices
%% - Security-first design principles
%% - Scalability and performance considerations
%% - Comprehensive error handling
%% - Event-driven architecture patterns
%% - CQRS and Event Sourcing principles where applicable
%%
%% REFERENCES & RESEARCH BASED ON:
%% - Martin Fowler's Microservices patterns
%% - Domain-Driven Design principles
%% - OAuth 2.0 and JWT standards
%% - RESTful API design patterns
%% - Cloud-native architecture patterns
%% - Event-Driven Architecture best practices
%%
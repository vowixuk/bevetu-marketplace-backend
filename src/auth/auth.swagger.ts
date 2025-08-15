import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';


// export function ApiGoogleLogin() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Log in with Google',
//       description:
//         'This endpoint allows users to log in using their Google account.',
//       tags: ['Authentication'],
//       deprecated: false,
//     }),
//     ApiBody({ type: GoogleLoginDto }),
//     ApiResponse({
//       status: 200,
//       description: 'Login successful',
//       schema: {
//         example: {
//           message: 'Login successful',
//           id: '123456',
//           givenName: 'John',
//           familyName: 'Doe',
//           email: 'john.doe@example.com',
//           isNewUser: true,
//           picture: 'https://example.com/avatar.jpg',
//         } as LoginWithGoogleReturnSchema,
//       },
//     }),
//   );
// }

// export function ApiCheckSession() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Check if user is authenticated',
//       description:
//         'This endpoint checks whether the user is authenticated. The client can call this endpoint to verify if the user is authorized to access specific pages.',
//       tags: ['Authentication'],
//       deprecated: false,
//     }),
//     ApiResponse({
//       status: 200,
//       description: 'Login successful',
//       schema: {
//         example: {
//           givenName: 'John',
//           familyName: 'Doe',
//           email: 'john.doe@example.com',
//         } as CheckSessionReturnSchema,
//       },
//     }),
//     ApiResponse({
//       status: 401,
//       description: 'Invalid or expired token',
//       schema: {
//         example: {
//           message: 'Invalid or expired token',
//         },
//       },
//     }),
//   );
// }



// export function ApiGoogleLoginMock() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Mock Google Login Endpoint',
//       description:
//         'Simulates a Google login process. Use "4242-4242-4242-4242" as the idToken for a successful response.',
//       tags: ['Authentication'],
//       deprecated: false,
//     }),
//     ApiBody({ type: GoogleLoginDto }),
//     ApiResponse({
//       status: 200,
//       description: 'Login successful',
//       schema: {
//         example: {
//           message: 'Login successful',
//           givenName: 'Herman',
//           familyName: 'Lam',
//           email: 'testingUser@bevetu.com',
//           isNewUser: true,
//           picture: 'https://example.com/avatar.jpg',
//         } as LoginWithGoogleReturnSchema,
//       },
//     }),
//   );
// }

// export function ApiRegenerateAccessToken() {
//   return applyDecorators(
//     ApiOperation({
//       summary: 'Regenerate Access Token for Mobile Applications',
//       description:
//         'This endpoint allows for regenerating an access token using a valid refresh token. It is primarily intended for mobile applications where the access token may expire. For web applications, as both the access and refresh tokens are stored in cookies, the token regeneration is handled automatically. Therefore, web applications do not need to use this function.',
//       tags: ['Authentication'],
//       deprecated: false,
//     }),
//     ApiBody({ type: RegenerateAccessTokenDto }),
//     ApiResponse({
//       status: 200,
//       description: 'Access token regenerated successfully',
//       schema: {
//         example: {
//           token:
//             'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjEyMzY2NTU0fQ.Nt3egKXYkIuqlH9FDeSOjXU3QLPEWFl-uwBhZpEqlV4', // Example JWT token
//         } as RegenerateAccessTokenReturnSchema,
//       },
//     }),
//   );
// }

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove the marketplace cookies',
      description: 'Remove the marketplace cookies',
    }),
    ApiResponse({
      status: 200,
      description: 'Logout successful',
      schema: {
        example: {
          message: 'Logout successful',
        },
      },
    }),
  );
}
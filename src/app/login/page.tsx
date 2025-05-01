import { Box, Button, Typography } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Image from 'next/image';
import loginImage from '@/assets/login_image.jpg'; // Use your actual image path
import { signIn } from '@/lib/auth';

const Page = async () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Left side with image */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Image
          src={loginImage}
          alt="Login"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </Box>

      {/* Right side with sign-in content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          StoreX
        </Typography>
        <Typography variant="body1" mb={4}>
          Sign in with your Google account to continue
        </Typography>

        {/* Server action form */}
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}
        >
          <Button
            type="submit"
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '16px',
              px: 4,
              py: 1.5,
              borderRadius: '25px',
            }}
          >
            Sign in with Google
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Page;

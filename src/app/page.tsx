import { Box, Button, Typography } from '@mui/material';
import './globals.css';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();
  if (!session) return redirect('/login');

  const userName = session?.user?.name;

  return (
    <Box p={4}>
      <Typography variant="h6">Welcome</Typography>
      <Typography variant="body2" mb={2}> {userName}</Typography>
      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <Button type="submit" variant="outlined" color="secondary">
          Log Out
        </Button>
      </form>
    </Box>
  );
}

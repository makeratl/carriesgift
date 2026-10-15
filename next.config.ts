import type { NextConfig } from 'next';
import { withBotId } from 'botid/next/config';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // Update photos are served from the Supabase storage bucket.
  images: { remotePatterns: supabase ? [new URL(`${supabase}/storage/v1/object/public/update-photos/**`)] : [] },
};

export default withBotId(nextConfig);

import type { NextConfig } from 'next';
import { withBotId } from 'botid/next/config';

// Update photos are stored in Postgres and served from /photos (same origin), so no remote image hosts.
const nextConfig: NextConfig = {};

export default withBotId(nextConfig);

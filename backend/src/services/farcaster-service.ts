import type { Env } from '../index';

const NEYNAR_API = 'https://api.neynar.com/v2';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  followerCount: number;
  followingCount: number;
}

export async function validateFrame(
  env: Env,
  trustedData: string
): Promise<{ valid: boolean; user?: FarcasterUser }> {
  if (!env.NEYNAR_API_KEY) {
    return { valid: false };
  }

  try {
    const response = await fetch(`${NEYNAR_API}/farcaster/frame/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEYNAR_API_KEY,
      },
      body: JSON.stringify({ frameData: trustedData }),
    });

    const data = await response.json() as {
      valid?: boolean;
      action?: {
        interacted?: {
          user?: {
            fid: number;
            username: string;
            display_name: string;
            pfp_url: string;
            follower_count: number;
            following_count: number;
          };
        };
      };
    };

    if (data.valid && data.action?.interacted?.user) {
      const u = data.action.interacted.user;
      return {
        valid: true,
        user: {
          fid: u.fid,
          username: u.username,
          displayName: u.display_name,
          pfpUrl: u.pfp_url,
          followerCount: u.follower_count,
          followingCount: u.following_count,
        },
      };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export async function getUserByFid(
  env: Env,
  fid: number
): Promise<FarcasterUser | null> {
  if (!env.NEYNAR_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`${NEYNAR_API}/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'x-api-key': env.NEYNAR_API_KEY,
      },
    });

    const data = await response.json() as {
      users?: Array<{
        fid: number;
        username: string;
        display_name: string;
        pfp_url: string;
        follower_count: number;
        following_count: number;
      }>;
    };

    const user = data.users?.[0];
    if (!user) return null;

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      followerCount: user.follower_count,
      followingCount: user.following_count,
    };
  } catch {
    return null;
  }
}

export function buildFrameHtml(baseUrl: string, config: {
  image: string;
  buttons: Array<{ label: string; action?: 'post' | 'link'; target?: string }>;
  input?: { text: string };
}): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${config.image}">`;

  config.buttons.forEach((btn, i) => {
    html += `\n  <meta property="fc:frame:button:${i + 1}" content="${btn.label}">`;
    if (btn.action) {
      html += `\n  <meta property="fc:frame:button:${i + 1}:action" content="${btn.action}">`;
    }
    if (btn.target) {
      html += `\n  <meta property="fc:frame:button:${i + 1}:target" content="${btn.target}">`;
    }
  });

  if (config.input) {
    html += `\n  <meta property="fc:frame:input:text" content="${config.input.text}">`;
  }

  html += `
</head>
<body></body>
</html>`;

  return html;
}

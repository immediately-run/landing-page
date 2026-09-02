import { useAuth } from '@immediately-run/sdk';
import PlatformLink from './PlatformLink';

// The door (R3-513; FRONT_DOOR_IA §6) — ONE element in the same position
// everywhere it appears: nav right cluster, mobile top bar, mobile sheet,
// closing band.
//
// The gate is `status === 'signed-in'`, NEVER `user`: the landing's capability
// ceiling carries `auth:status` but not `auth:identity`, so the SDK redacts
// `user` to `null` in this frame for everyone — a `Boolean(user)` gate (the
// R3-486 defect) never renders on the host. `unknown` renders the signed-out
// state, so nothing flashes while the host reports.
//
// No avatar and no sign-in are drawn here: neither is available to this frame,
// and the landing never renders credential UI. The door hands the visitor to
// `/home`, where the host draws its own sign-in posture when signed out. The
// label is "Home" either way the state flips — the host's own signed-out
// screen calls it Home, and "Your stuff" would promise recents that do not
// exist yet (R-OSO-20/21).

function Door({ className = 'door' }: { className?: string }) {
  const { status } = useAuth();
  const signedIn = status === 'signed-in';
  return (
    <PlatformLink className={className} path="/home" aria-label={signedIn ? 'Home' : 'Sign in'}>
      {signedIn ? 'Home' : 'Sign in'}
    </PlatformLink>
  );
}

export default Door;

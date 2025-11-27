// app/@modal/(.)signup/page.tsx
import { signup } from "@/app/(login)/login/actions";
import AuthModal from "@/components/Modal/auth/AuthModal";

export default function SignupModal() {
  return (
    <AuthModal>
      <form>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required />
        <label htmlFor="confirm">Confirm Password:</label>
        <input id="confirm" name="confirm" type="password" required />
        <button formAction={signup}>Sign up</button>
      </form>
    </AuthModal>
  );
}

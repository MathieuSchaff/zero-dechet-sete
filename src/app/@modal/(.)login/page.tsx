// app/@modal/(.)login/page.tsx
import { login } from "@/app/(login)/login/actions";
import AuthModal from "@/components/Modal/auth/AuthModal";

export default function LoginModal() {
  return (
    <AuthModal>
      <form>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required />
        <button formAction={login}>Log in</button>
      </form>
    </AuthModal>
  );
}

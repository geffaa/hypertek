import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSignMessage } from "wagmi";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_BASE_URL } from "../Config";
import { loginSuccess } from "../Redux/AuthSlice";

/**
 * Shared link/unlink logic for external wallets: sign the account-scoped
 * message with the connected wallet, register it on the backend, and refresh
 * the redux user so every consumer of useActiveWallet picks it up.
 */
export function useLinkExternalWallet() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const { signMessageAsync } = useSignMessage();
  const [busy, setBusy] = useState(false);

  const refreshUser = (LinkedWallets) => {
    dispatch(loginSuccess({ user: { ...user, LinkedWallets }, token, isLoggedInUser: true }));
  };

  const linkWallet = async (address) => {
    if (!address || !user?.id || !token) return false;
    setBusy(true);
    const toastId = toast.loading("Confirm the signature in your wallet...");
    try {
      const signature = await signMessageAsync({ message: `hypertek-link-external:${user.id}` });
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/v1/user/link-external-wallet`,
        { address, signature },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshUser(res.data.LinkedWallets);
      toast.success("Wallet linked to your account!", { id: toastId });
      return true;
    } catch (e) {
      const msg = e?.response?.data?.message || (e?.name === "UserRejectedRequestError" ? "Signature cancelled" : "Linking failed");
      toast.error(msg, { id: toastId });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const unlinkWallet = async (address) => {
    setBusy(true);
    try {
      const res = await axios.delete(`${BACKEND_BASE_URL}/api/v1/user/link-external-wallet`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { address },
      });
      refreshUser(res.data.LinkedWallets);
      toast.success("Wallet unlinked");
      return true;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Unlink failed");
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { linkWallet, unlinkWallet, busy };
}

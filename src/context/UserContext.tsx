'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
} from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/firebase';
import { colorFromUid } from '@/lib/colors';
import { AppUser } from '@/types/spreadsheet';

// ─── Context ─────────────────────────────────────────────────────────────────

interface UserContextValue {
    user: AppUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithName: (name: string) => void;
    signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

// ─── Local-storage keys ──────────────────────────────────────────────────────

const LS_UID = 'collab_uid';
const LS_NAME = 'collab_name';

// ─── Provider ────────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    // We listen for Firebase Auth changes first, then fall back to localStorage.
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName ?? firebaseUser.email ?? 'Anonymous',
                    color: colorFromUid(firebaseUser.uid),
                });
            } else {
                // No Firebase session — try localStorage (guest mode)
                const storedUid = localStorage.getItem(LS_UID);
                const storedName = localStorage.getItem(LS_NAME);
                if (storedUid && storedName) {
                    setUser({
                        uid: storedUid,
                        name: storedName,
                        color: colorFromUid(storedUid),
                    });
                } else {
                    setUser(null);
                }
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }, []);

    /** Guest mode — persist a random uid + chosen name in localStorage */
    const signInWithName = useCallback((name: string) => {
        const uid = uuidv4();
        localStorage.setItem(LS_UID, uid);
        localStorage.setItem(LS_NAME, name);
        setUser({ uid, name, color: colorFromUid(uid) });
    }, []);

    const handleSignOut = useCallback(async () => {
        localStorage.removeItem(LS_UID);
        localStorage.removeItem(LS_NAME);
        await signOut(auth);
        setUser(null);
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                signInWithGoogle,
                signInWithName,
                signOut: handleSignOut,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
    return ctx;
}

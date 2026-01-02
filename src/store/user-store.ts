import { IUser } from "@/interfaces"
import {create} from "zustand"

export interface UsersStore {
  user: Partial<IUser> | null
  setUser: (payload: Partial<IUser> | null) => void
}

const useUsersStore = create<UsersStore>((set) => ({
  user : null,
  setUser : (payload: Partial<IUser> | null) => set({ user : payload })
}))

export default useUsersStore
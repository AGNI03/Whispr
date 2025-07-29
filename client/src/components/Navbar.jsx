import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { LogOut, MessageSquare, Settings, User, Users } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { setSelectedUser, setSelectedGroup } = useChatStore();
  const LogOut_function = () =>{
    setSelectedUser(null);
    setSelectedGroup(null);
    logout();
  }

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Whispr</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <div className="dropdown dropdown-bottom dropdown-end">
                  <div tabIndex={0} role="button">
                    {authUser.profilePic ? (
                      <img
                        src={authUser.profilePic}
                        alt="Profile"
                        onClick={() => setShowMenu(!showMenu)}
                        className="size-10 rounded-full object-cover border-2 hover:scale-105 transition-transform cursor-pointer"
                      />
                    ) : (
                      <User
                        onClick={() => setShowMenu(!showMenu)}
                        className="size-10 text-gray-400 rounded-full object-cover border-2 border-base-content hover:scale-105 transition-transform cursor-pointer"
                      />
                    )}
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu mt-3 bg-base-100 border-1 rounded-md border-base rounded-box z-1 w-52 p-2 shadow-sm"
                  >
                    <li>
                      <Link to={"/profile"}>
                        <User className="size-5" />
                        <span className="hidden sm:inline">Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link to={"/create-group"}>
                        <Users className="size-5" />
                        <span className="hidden sm:inline">Create Group</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        className="flex gap-2 items-center"
                        onClick={LogOut_function}
                      >
                        <LogOut className="size-5" />
                        <span className="hidden sm:inline">Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;

import Image from "next/image";

const AuthLayout = ({ children }) => {
  const currentYear = new Date().getFullYear();
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        <div className="flex flex-col justify-center h-screen bg-gradient-to-br bg-blue-500 via-blue-200 to-blue-100 p-5">
          <div className="flex flex-col gap-3 w-full h-full justify-center bg-white/20 p-5 rounded-lg shadow-lg backdrop-blur-2xl">
            <div className="text-2xl">
              Welcome to <span className="text-zinc-800">Posture</span> Perfect
            </div>
            <div className="text-base tracking-wider mt-2 pl-2 text-justify">
              The Techflow CMS Portal is your all-in-one platform for managing
              our website and enhancing Techflow Industry's digital presence.
              Easily create, edit, and publish content while ensuring
              consistency and professionalism.
            </div>
            <div className="text-base tracking-wider pl-2 text-justify">
              Beyond content management, this portal streamlines internal
              workflows and communication, making it a vital tool for innovation
              and operational excellence. Welcome to the hub of our digital
              growth!
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="flex-grow flex w-full items-center justify-center px-10">
            {children}
          </div>
          <div className="flex flex-wrap justify-center items-center text-black/70 text-sm mb-3 font-semibold gap-3 text-center">
            <div>© {currentYear} Posture Perfect </div>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <div className="text-blue-500">Privacy Policy</div>
              <div className="text-blue-500">Terms of Service</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;

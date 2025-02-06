import React from "react";


interface UserProfileProps {
  color?: string;
  className?: string;
  onClickFun?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  className = "",
  onClickFun,
  color,
}) => {
  return (
    <div
      // Properly concatenate class names
      className={`text-${color}-500`}
      onClick={() => {
        if (onClickFun) {
          onClickFun(); // Call the function if defined
        }
      }}
    >
      <svg
        className={`${className} w-full text-${color}-500 `}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z"></path>
      </svg>
    </div>
  );
};

export default UserProfile;

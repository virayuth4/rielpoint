import React, { useState } from 'react';

import Link from 'next/link';

const AuthComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState('signin');
  

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      // Reset to sign-in when closing the modal
      setActiveModal('signin');
    }
  };

  const switchToSignUp = () => {
    setActiveModal('signup');
  };

  const switchToSignIn = () => {
    setActiveModal('signin');
  };

  return (
    <div className=" flex items-center space-x-2">
    <Link href="/login">
      <button  
        className="uppercase font-mono tracking-[0.1em] inline-flex items-center px-2 sm:px-4 py-2 sm:py-2 shadow-none text-[12px] transition-all duration-200  hover:underline text-black">
        
        {("Log In")}
      </button>
    </Link>

    {/* <Link href="/signup">
      <button  
        className="hidden md:inline-flex items-center px-2 sm:px-4 py-2 sm:py-2 shadow-none rounded-lg text-xs sm:text-sm font-medium transition-all duration-200  hover:underline text-black">
            {translate("Sign Up")}
      </button>
    </Link> */}
  </div>
    // <Dialog open={isOpen} onOpenChange={handleOpenChange}>
    //   <DialogTrigger asChild>
    //     <Button  
    //       className="inline-flex items-center px-2 sm:px-4 py-2 sm:py-2 shadow-none rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 bg-white hover:bg-gray-200 text-black ">
    //       <User className="h-4 w-4" />
    //       Sign In
    //     </Button>
    //   </DialogTrigger>
    //   <DialogContent className="sm:max-w-[400px] p-0">
    //     <VisuallyHidden>
    //       <DialogTitle className="text-lg font-semibold">
    //         {activeModal === 'signin' ? 'Sign In' : 'Sign Up'}
    //       </DialogTitle>
    //     </VisuallyHidden>
    //     {activeModal === 'signin' ? (
    //       <SignInModal switchToSignUp={switchToSignUp}/>
    //     ) : (
    //       <SignUpModal switchToSignIn={switchToSignIn} />
    //     )}
    //   </DialogContent>
    // </Dialog>
  );
};

export default AuthComponent;
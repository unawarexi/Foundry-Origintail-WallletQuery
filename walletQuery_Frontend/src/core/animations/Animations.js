// Animation variants for sidebar components

/**
 * Sidebar animation variants for mobile and desktop
 */
export const sidebarVariants = {
  mobile: {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  },
  desktop: {
    expanded: {
      width: "240px", // Reduced from 280px/320px
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    collapsed: {
      width: "64px", // Reduced from 80px
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  },
};

/**
 * Content animation variants for showing/hiding elements
 */
export const contentVariants = {
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
    },
  },
  hide: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Individual item animation variants
 */
export const itemVariants = {
  show: {
    opacity: 1,
    x: 0,
  },
  hide: {
    opacity: 0,
    x: -20,
  },
};

/**
 * Menu button icon animation variants
 */
export const menuIconVariants = {
  close: {
    initial: { rotate: 0 },
    animate: { rotate: 0 },
    exit: { rotate: 90 },
    transition: { duration: 0.2 },
  },
  menu: {
    initial: { rotate: -90 },
    animate: { rotate: 0 },
    exit: { rotate: 0 },
    transition: { duration: 0.2 },
  },
};

/**
 * Chevron collapse button animation
 */
export const chevronVariants = {
  expanded: { rotate: 180 },
  collapsed: { rotate: 0 },
  transition: { duration: 0.3 },
};

/**
 * Active indicator animation
 */
export const activeIndicatorTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/**
 * Active arrow animation
 */
export const activeArrowVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
};


  export const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };
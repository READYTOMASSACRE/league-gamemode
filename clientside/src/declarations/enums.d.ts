declare namespace ENUMS {
  /**
   * An enum of CEF packages
   */
  const enum CEF {
    MAIN = 'package://cef/index.html'
    // MAIN = 'http://localhost:3000'
    // MAIN = 'http://192.168.0.100:3000/'
  }

  /**
   * An enum of keycodes
   */
  const enum KEYCODES {
    VK_LEFT   = 0x25,
    VK_UP     = 0x26,
    VK_RIGHT  = 0x27,
    VK_DOWN   = 0x28,
    VK_RETURN = 0x0D,
    W         = 0x57,
    A         = 0x41,
    S         = 0x53,
    D         = 0x44,
    VK_F2     = 0x71,
    VK_F3     = 0x72,
    VK_F4     = 0x73,
    VK_F7     = 0x76,
    VK_TILDE  = 0xC0,
    VK_1      = 0x31,
    VK_2      = 0x32,
    VK_3      = 0x33,
    VK_4      = 0x34,
    VK_5      = 0x35,
    VK_E      = 0x45,
    VK_R      = 0x52,
    VK_X      = 0x58,
    VK_C      = 0x43,
    VK_F      = 0x46,
    VK_T      = 0x54,
  }

  const enum BONES {
    IK_Head = 12844,
    SKEL_L_Foot = 14201,
  }

  const enum CONTROLS {
    F5        = 327,
    W         = 32,
    S         = 33,
    A         = 34,
    D         = 35,
    Space     = 321,
    LCtrl     = 326,
    LShift    = 21,
    LAlt      = 19,
  }
}
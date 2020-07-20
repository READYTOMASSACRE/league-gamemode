declare namespace ENUMS {
  /**
   * An enum of CEF packages
   */
  const enum CEF {
    MAIN = 'package://cef/index.html'
    // MAIN = 'http://localhost:3000'
    // MAIN = 'http://192.168.0.102:3000/'
  }

  /**
   * An enum of keycodes
   */
  const enum KEYCODES {
    VK_LEFT = 0x25,
    VK_UP = 0x26,
    VK_RIGHT = 0x27,
    VK_DOWN = 0x28,
    VK_RETURN = 0x0D,
    W = 0x57,
    A = 0x41,
    S = 0x53,
    D = 0x44,
    VK_F4 = 0x73,
    VK_TILDE = 0xC0,
  }

  const enum BONES {
    IK_Head = 12844,
  }
}
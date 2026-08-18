declare module '@iconscout/react-unicons' {
  import { FC, SVGAttributes } from 'react';

  interface IconProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    className?: string;
  }

  type Icon = FC<IconProps>;

  // Declare every icon used in the project
  export const UilHome: Icon;
  export const UilShoppingCart: Icon;
  export const UilUser: Icon;
  export const UilSearch: Icon;
  export const UilBell: Icon;
  export const UilHeart: Icon;
  export const UilStar: Icon;
  export const UilStarHalfAlt: Icon;
  export const UilArrowLeft: Icon;
  export const UilArrowRight: Icon;
  export const UilCheck: Icon;
  export const UilTimes: Icon;
  export const UilPlus: Icon;
  export const UilMinus: Icon;
  export const UilTrash: Icon;
  export const UilEdit: Icon;
  export const UilEye: Icon;
  export const UilEyeSlash: Icon;
  export const UilPackage: Icon;
  export const UilStore: Icon;
  export const UilMoneyBill: Icon;
  export const UilChartLine: Icon;
  export const UilEnvelope: Icon;
  export const UilPhone: Icon;
  export const UilMapMarker: Icon;
  export const UilLock: Icon;
  export const UilUnlock: Icon;
  export const UilSignInAlt: Icon;
  export const UilSignOutAlt: Icon;
  export const UilUserPlus: Icon;
  export const UilUserCircle: Icon;
  export const UilShield: Icon;
  export const UilFire: Icon;
  export const UilTag: Icon;
  export const UilPercent: Icon;
  export const UilFilter: Icon;
  export const UilSort: Icon;
  export const UilGrid: Icon;
  export const UilList: Icon;
  export const UilBars: Icon;
  export const UilInfo: Icon;
  export const UilExclamationTriangle: Icon;
  export const UilCheckCircle: Icon;
  export const UilTimesCircle: Icon;
  export const UilRefresh: Icon;
  export const UilDownloadAlt: Icon;
  export const UilUpload: Icon;
  export const UilImages: Icon;
  export const UilCamera: Icon;
  export const UilCog: Icon;
  export const UilGlobe: Icon;
  export const UilEllipsisV: Icon;
  export const UilSmile: Icon;
  export const UilMessage: Icon;
  export const UilCommentAlt: Icon;
  export const UilSend: Icon;
  export const UilPaperclip: Icon;
  export const UilMicrophone: Icon;
  export const UilTruck: Icon;
  export const UilBox: Icon;
  export const UilClipboardAlt: Icon;
  export const UilThumbsUp: Icon;
  export const UilSync: Icon;
  export const UilAngleDown: Icon;
  export const UilAngleUp: Icon;
  export const UilAngleRight: Icon;
  export const UilAngleLeft: Icon;
}

// Phosphor icons (Bold, Fill for active states), per the design system's iconography rules.
// The /ssr build has no React context, so it renders in server and client components alike.
import {
  ArrowCounterClockwiseIcon as ArrowCounterClockwise, ArrowLeftIcon as ArrowLeft, ArrowsLeftRightIcon as ArrowsLeftRight,
  BookOpenIcon as BookOpen, BarbellIcon as Barbell, CaretRightIcon as CaretRight, ChatCircleIcon as ChatCircle,
  CheckIcon as Check, CompassIcon as Compass, CrownIcon as Crown, DotsThreeVerticalIcon as DotsThreeVertical,
  GameControllerIcon as GameController, GlobeHemisphereWestIcon as GlobeHemisphereWest, GuitarIcon as Guitar,
  HandshakeIcon as Handshake, HeartIcon as Heart, HouseIcon as House, ImageIcon, LaptopIcon as Laptop,
  LightningIcon as Lightning, MagnifyingGlassIcon as MagnifyingGlass, MapPinIcon as MapPin, MicrophoneIcon as Microphone,
  PackageIcon as Package, PaletteIcon as Palette, PaperPlaneRightIcon as PaperPlaneRight, PlantIcon as Plant,
  PlusIcon as Plus, ShieldCheckIcon as ShieldCheck, ShuffleIcon as Shuffle, StarIcon as Star, StorefrontIcon as Storefront,
  TShirtIcon as TShirt, UserIcon as User, VideoCameraIcon as VideoCamera, WrenchIcon as Wrench, XIcon as X,
  LockIcon as Lock, MegaphoneIcon as Megaphone, CameraIcon as Camera, InfoIcon as Info, SealCheckIcon as SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react";

const ICONS = {
  x: X,
  heart: Heart,
  star: Star,
  undo: ArrowCounterClockwise,
  pin: MapPin,
  swap: ArrowsLeftRight,
  plus: Plus,
  check: Check,
  back: ArrowLeft,
  next: CaretRight,
  search: MagnifyingGlass,
  compass: Compass,
  chat: ChatCircle,
  user: User,
  more: DotsThreeVertical,
  send: PaperPlaneRight,
  mic: Microphone,
  image: ImageIcon,
  camera: Camera,
  video: VideoCamera,
  lock: Lock,
  megaphone: Megaphone,
  info: Info,
  verified: SealCheck,
  // Badges
  handshake: Handshake,
  package: Package,
  storefront: Storefront,
  crown: Crown,
  lightning: Lightning,
  globe: GlobeHemisphereWest,
  shuffle: Shuffle,
  shield: ShieldCheck,
  // Categories
  electronica: Laptop,
  ropa: TShirt,
  "libros-coleccionables": BookOpen,
  instrumentos: Guitar,
  deportes: Barbell,
  hogar: House,
  videojuegos: GameController,
  arte: Palette,
  plantas: Plant,
  servicios: Wrench,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, weight = "bold", className, label }: { name: IconName; weight?: IconWeight; className?: string; label?: string }) {
  const C = ICONS[name];
  return (
    <C
      className={className ? `tx-ico ${className}` : "tx-ico"}
      weight={weight}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}

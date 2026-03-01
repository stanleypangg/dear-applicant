import { LazyMotion, domAnimation } from "motion/react";

export function MotionWrapper({ children }: { children: React.ReactNode }) {
	return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}

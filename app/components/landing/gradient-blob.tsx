const blob1 =
	"M450,280C470,180,400,110,300,100C200,90,120,160,110,270C100,380,170,460,280,470C390,480,430,380,450,280Z";
const blob2 =
	"M420,310C450,200,380,110,280,90C180,70,100,140,90,250C80,360,140,460,250,480C360,500,390,420,420,310Z";
const blob3 =
	"M440,260C460,170,390,90,290,80C190,70,110,150,100,260C90,370,160,470,270,480C380,490,420,350,440,260Z";

export function GradientBlob() {
	return (
		<div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
			<svg
				viewBox="0 0 600 600"
				className="w-[700px] h-[700px] md:w-[900px] md:h-[900px] opacity-30 dark:opacity-20 blur-3xl"
			>
				<defs>
					<linearGradient
						id="blob-gradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#10b981" />
						<stop offset="50%" stopColor="#34d399" />
						<stop offset="100%" stopColor="#6ee7b7" />
					</linearGradient>
				</defs>
				<path fill="url(#blob-gradient)" d={blob1}>
					<animate
						attributeName="d"
						dur="8s"
						repeatCount="indefinite"
						values={`${blob1};${blob2};${blob3};${blob1}`}
					/>
				</path>
			</svg>
		</div>
	);
}

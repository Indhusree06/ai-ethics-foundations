export interface Philosopher {
  id: string;
  name: string;
  dates: string;
  framework: string;
  quote: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
}

export interface Principle {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
}

export interface Pioneer {
  id: string;
  name: string;
  field: string;
  institution: string;
  book: string;
  bookYear: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
}

export interface Connection {
  philosopherId: string;
  principleId: string;
  pioneerId: string;
  bridgeText: string;
}

export const philosophers: Philosopher[] = [
  {
    id: "aristotle",
    name: "Aristotle",
    dates: "384–322 BC",
    framework: "Virtue Ethics",
    quote: "Excellence is an art won by training and habituation.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/ediBcBHBjxqAgaFP.png",
    shortDesc: "Character & practical wisdom are the foundation of ethical action.",
    fullDesc: "Aristotle's Virtue Ethics centers on the idea that moral excellence comes through developing good character traits (virtues) via practice and habituation. His concept of phronesis (practical wisdom) — the ability to discern the right course of action in complex situations — is foundational. Rather than following rigid rules, Aristotle argued that ethical behavior emerges from cultivating virtuous dispositions: courage, temperance, justice, and wisdom. This framework emphasizes that being good is about who you are, not just what you do.",
  },
  {
    id: "kant",
    name: "Immanuel Kant",
    dates: "1724–1804",
    framework: "Deontological Ethics",
    quote: "The starry heavens above me and the moral law within me.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/pRHXgcAqaFwVBctH.png",
    shortDesc: "Moral duties and rules must be followed regardless of consequences.",
    fullDesc: "Kant's Deontological Ethics holds that the morality of an action is determined by whether it follows a moral rule or duty, not by its outcomes. His Categorical Imperative states: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.' Central to Kant's philosophy is the principle that persons must always be treated as ends in themselves, never merely as means. This dignity-based framework insists that rational beings have inherent worth that must never be instrumentalized.",
  },
  {
    id: "mill",
    name: "John Stuart Mill",
    dates: "1806–1873",
    framework: "Utilitarianism",
    quote: "Better to be Socrates dissatisfied than a fool satisfied.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/IsGnYbXMlGGKKxpt.png",
    shortDesc: "Actions are right if they promote the greatest good for the greatest number.",
    fullDesc: "Mill's Utilitarianism evaluates the morality of actions based on their consequences — specifically, the amount of happiness or well-being they produce. The 'Greatest Happiness Principle' holds that actions are right in proportion as they tend to promote happiness, wrong as they tend to produce the reverse. Mill refined Bentham's earlier utilitarianism by distinguishing between higher and lower pleasures, arguing that intellectual and moral pleasures are superior to mere physical satisfaction. This consequentialist framework demands that we consider the welfare of all affected parties.",
  },
  {
    id: "rawls",
    name: "John Rawls",
    dates: "1921–2002",
    framework: "Justice as Fairness",
    quote: "Justice is the first virtue of social institutions.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/BbbbTJduzwMzFIhD.png",
    shortDesc: "Fair systems are designed behind a 'veil of ignorance.'",
    fullDesc: "Rawls' theory of Justice as Fairness proposes that the principles of a just society are those that would be chosen by rational individuals behind a 'veil of ignorance' — where no one knows their place in society, their class, race, gender, or natural abilities. From this 'original position,' Rawls argued people would choose two principles: equal basic liberties for all, and that social and economic inequalities should be arranged to benefit the least advantaged members of society. This framework provides a powerful tool for evaluating whether institutions and systems treat people fairly.",
  },
  {
    id: "singer",
    name: "Peter Singer",
    dates: "b. 1946",
    framework: "Effective Altruism",
    quote: "If it is in our power to prevent something bad from happening... we ought to do it.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/eZpTsPBLNYrdcPve.png",
    shortDesc: "Those with power have a moral obligation to reduce suffering.",
    fullDesc: "Singer's philosophy extends utilitarian thinking to argue that those with the ability to prevent suffering have a moral obligation to do so. His Effective Altruism movement applies evidence and reason to determine the most effective ways to improve the world. Singer challenges the notion that distance or nationality diminish our moral obligations — if we can help, we should. His work on expanding the circle of moral consideration has been profoundly influential, arguing that the interests of all sentient beings deserve equal consideration regardless of species, race, or nationality.",
  },
];

export const principles: Principle[] = [
  {
    id: "explicability",
    name: "Explicability",
    shortDesc: "AI decisions must be understandable and contestable.",
    fullDesc: "Explicability requires that AI systems be transparent in their decision-making processes. When AI affects human lives — in healthcare, criminal justice, hiring, or finance — people have a right to understand how decisions are made and to contest them. This principle draws from Aristotle's emphasis on practical wisdom (phronesis): just as virtuous action requires understanding and deliberation, ethical AI requires that its reasoning be accessible to human scrutiny. Explicability encompasses both transparency (how the system works) and accountability (who is responsible when things go wrong).",
  },
  {
    id: "autonomy",
    name: "Autonomy",
    shortDesc: "AI must respect human agency and self-determination.",
    fullDesc: "The principle of Autonomy demands that AI systems preserve and enhance human agency rather than diminish it. Drawing from Kant's insistence that persons must be treated as ends in themselves, this principle requires that AI never reduces humans to mere data points or manipulates their choices. Autonomous AI systems must be designed to support informed human decision-making, maintain meaningful human control, and ensure that individuals retain the right to opt out of automated processes. The goal is AI that empowers rather than controls.",
  },
  {
    id: "beneficence",
    name: "Beneficence",
    shortDesc: "AI should actively promote human well-being.",
    fullDesc: "Beneficence requires that AI systems be designed and deployed to actively promote human welfare and the common good. Rooted in Mill's utilitarian principle of maximizing happiness for the greatest number, this principle goes beyond merely avoiding harm — it demands that AI create positive value. AI developers must consider the broad societal impact of their systems, ensure equitable distribution of benefits, and design technology that enhances quality of life. Beneficent AI serves humanity's collective interests, not just the interests of its creators or deployers.",
  },
  {
    id: "justice",
    name: "Justice",
    shortDesc: "AI must be fair and not discriminate against any group.",
    fullDesc: "The principle of Justice requires that AI systems treat all people fairly and do not perpetuate or amplify existing social inequalities. Inspired by Rawls' veil of ignorance, this principle asks: would we accept this AI system's decisions if we didn't know which group we belonged to? Justice in AI demands rigorous testing for bias across race, gender, age, disability, and socioeconomic status. It requires that the benefits and burdens of AI be distributed equitably, and that vulnerable populations receive special consideration and protection.",
  },
  {
    id: "non-maleficence",
    name: "Non-Maleficence",
    shortDesc: "AI must not cause harm to individuals or society.",
    fullDesc: "Non-Maleficence — the duty to 'do no harm' — requires that AI systems be designed, developed, and deployed with robust safeguards against causing damage to individuals, communities, or society. Drawing from Singer's argument that those with power bear moral responsibility, this principle holds AI developers accountable for foreseeable harms. It encompasses physical safety, psychological well-being, privacy protection, and prevention of societal damage. When risks cannot be eliminated, they must be minimized, disclosed, and monitored continuously.",
  },
];

export const pioneers: Pioneer[] = [
  {
    id: "vallor",
    name: "Shannon Vallor",
    field: "Virtue Ethics of Technology",
    institution: "University of Edinburgh",
    book: "Technology and the Virtues",
    bookYear: "2016",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/jRSvdfMkmMetTjVO.png",
    shortDesc: "Applying Aristotelian virtue ethics to emerging technologies.",
    fullDesc: "Shannon Vallor's groundbreaking work bridges Aristotle's virtue ethics with modern technology ethics. In 'Technology and the Virtues' (2016), she argues that cultivating 'technomoral virtues' — such as honesty, justice, courage, empathy, care, civility, flexibility, perspective, magnanimity, and self-control — is essential for humans to flourish alongside emerging technologies. Vallor contends that we need a new kind of practical wisdom (techne + phronesis) to navigate the ethical challenges posed by AI, social media, surveillance, and biotechnology.",
  },
  {
    id: "russell",
    name: "Stuart Russell",
    field: "Human-Compatible AI",
    institution: "UC Berkeley",
    book: "Human Compatible",
    bookYear: "2019",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/IBKgueUmRQckhSKP.png",
    shortDesc: "Building AI systems that defer to human values and preferences.",
    fullDesc: "Stuart Russell, one of the world's leading AI researchers, argues in 'Human Compatible' (2019) that the standard model of AI — optimizing a fixed objective — is fundamentally flawed and dangerous. Instead, he proposes that AI systems should be designed to be uncertain about human preferences and to defer to humans. This approach, rooted in Kant's principle that persons must never be treated merely as means, ensures that AI remains under meaningful human control. Russell's three principles: AI should maximize human preferences, be uncertain about those preferences, and learn them from human behavior.",
  },
  {
    id: "floridi",
    name: "Luciano Floridi",
    field: "Information Ethics",
    institution: "Yale / Oxford",
    book: "The Fourth Revolution",
    bookYear: "2014",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/zxFhCMATGFkhAgqL.png",
    shortDesc: "Defining ethical frameworks for the information age.",
    fullDesc: "Luciano Floridi's Information Ethics provides a comprehensive framework for understanding our moral responsibilities in the digital age. In 'The Fourth Revolution' (2014), he argues that information and communication technologies are fundamentally reshaping human self-understanding — as profoundly as the revolutions of Copernicus, Darwin, and Freud. Floridi's framework, drawing on utilitarian principles of maximizing good, evaluates the ethical impact of information creation, processing, and distribution, advocating for AI that promotes human flourishing and the health of the 'infosphere.'",
  },
  {
    id: "wallach",
    name: "Wendell Wallach",
    field: "Machine Ethics",
    institution: "Yale University",
    book: "Moral Machines",
    bookYear: "2009",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/EyHEinrhJZKPZGdA.png",
    shortDesc: "Pioneering the field of building moral reasoning into machines.",
    fullDesc: "Wendell Wallach's 'Moral Machines' (2009) is a foundational text in machine ethics — the field of designing AI systems capable of moral reasoning. Wallach argues that as machines become more autonomous, they must be equipped with ethical decision-making capabilities. Drawing on Rawls' justice framework, he explores how fairness principles can be encoded into AI systems. Wallach advocates for a 'top-down' approach (programming ethical rules) combined with 'bottom-up' learning (allowing machines to develop ethical sensitivity through experience), ensuring AI systems can navigate complex moral landscapes.",
  },
  {
    id: "bostrom",
    name: "Nick Bostrom",
    field: "Existential Risk",
    institution: "University of Oxford",
    book: "Superintelligence",
    bookYear: "2014",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663029995870/zwYZWUCfEPoyPaVH.png",
    shortDesc: "Warning humanity about the existential risks of superintelligent AI.",
    fullDesc: "Nick Bostrom's 'Superintelligence' (2014) presents a rigorous analysis of the existential risks posed by artificial superintelligence. Drawing on Singer's principle that those with power bear moral responsibility, Bostrom argues that the development of AI systems surpassing human intelligence could pose an existential threat to humanity if not carefully managed. His work on the 'control problem' — how to ensure superintelligent AI remains aligned with human values — has shaped global policy discussions. Bostrom advocates for proactive safety research and international cooperation to prevent catastrophic outcomes.",
  },
];

export const connections: Connection[] = [
  {
    philosopherId: "aristotle",
    principleId: "explicability",
    pioneerId: "vallor",
    bridgeText: "Practical wisdom (phronesis) demands that ethical reasoning be transparent and understandable.",
  },
  {
    philosopherId: "kant",
    principleId: "autonomy",
    pioneerId: "russell",
    bridgeText: "Treating persons as ends requires that AI respect human agency and self-determination.",
  },
  {
    philosopherId: "mill",
    principleId: "beneficence",
    pioneerId: "floridi",
    bridgeText: "Maximizing the greatest good requires AI that actively promotes human well-being.",
  },
  {
    philosopherId: "rawls",
    principleId: "justice",
    pioneerId: "wallach",
    bridgeText: "The veil of ignorance demands AI systems that are fair to all, regardless of identity.",
  },
  {
    philosopherId: "singer",
    principleId: "non-maleficence",
    pioneerId: "bostrom",
    bridgeText: "Power entails moral obligation — those who build AI must ensure it does no harm.",
  },
];

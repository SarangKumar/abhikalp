import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/config/site";

const faqs = [
  {
    q: `Is ${siteConfig.name} free?`,
    a: "Yes. The Free plan includes up to 3 projects with tasks, docs and collaborators. Upgrade when you need more projects.",
  },
  {
    q: "Can I invite people who don't have an account?",
    a: "Yes. Invites are sent by email; they sign up with the invited address and the project appears on their dashboard.",
  },
  {
    q: "Which sign-in methods are supported?",
    a: "Email and password, Google and GitHub. OAuth accounts are linked to the same user by email.",
  },
  {
    q: "Can I reorder tasks on the board?",
    a: "Drag cards between columns or within a column. Keyboard users can pick up a card with Space and move it with the arrow keys.",
  },
  {
    q: "Is there an API?",
    a: "Yes, a versioned REST API for projects, tasks and docs. See the API reference in the docs.",
  },
];

export function Faq() {
  return (
    <Accordion className="bg-card mx-auto max-w-3xl rounded-xl border px-5">
      {faqs.map((f, i) => (
        <AccordionItem key={f.q} value={`faq-${i}`}>
          <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

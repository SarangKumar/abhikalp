import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { pricingFaq } from "@/constants";

const Faq = () => {
  return (
    <div className="w-full max-w-5xl px-6 lg:mx-auto">
      <h3 className="display mb-6 text-center text-2xl text-balance md:text-3xl">
        Frequently asked questions
      </h3>
      <Accordion type="single" collapsible className="w-full">
        {pricingFaq.map((faq) => (
          <AccordionItem
            key={faq.question}
            value={faq.question}
            className="border-b"
          >
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Faq;

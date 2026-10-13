import Container from "./container";

const Hero = () => {
  return (
    <Container className="mesh rounded-3xl">
      <div className="flex flex-col items-center justify-center space-y-4">
        <span className="chip animate-fade-up">
          <span className="chip-dot" />
          Projects · Tasks · AI
        </span>
        <h1 className="display text-foreground animate-fade-up mx-auto text-4xl sm:text-5xl sm:leading-none lg:text-7xl">
          <span className="block text-center text-balance">
            Collaborate, Create, and
          </span>
          <span className="text-primary block text-center text-balance">
            Conquer Projects with Ease!
          </span>
        </h1>
        <p className="text-muted-foreground animate-fade-up mx-auto my-3 max-w-xl pt-2 text-center text-sm text-balance sm:mt-5 sm:text-base lg:mb-0">
          Ultimate tool for team collaboration and workflow efficiency, perfect
          for solo developers or large teams to create, manage, and share
          projects effortlessly.
        </p>
      </div>
    </Container>
  );
};

export default Hero;

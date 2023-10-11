const Footer = () => {
  return (
    <footer className="bg-white mt-auto py-4 text-center w-full">
      <p>
        Built by{" "}
        <a
          className="text-amber-500 hover:underline"
          href="https://twitter.com/andrew_devsrc"
          target="_blank"
          rel="noreferrer"
        >
          andrew_devsrc
        </a>
        . View the source code for this project on{" "}
        <a
          className="text-amber-500 hover:underline"
          href="https://github.com/andrews1022/tinypng-clone-1-to-1"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </footer>
  );
};

export { Footer };

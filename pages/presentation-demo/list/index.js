export function getServerSideProps(ctx) {
  return {
    props: {
      linkedId: ctx.query.linkedId ?? null,
    },
  };
}

export default function Index({ linkedId }) {}

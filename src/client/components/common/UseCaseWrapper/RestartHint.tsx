export type RestartHintProps = {
  setPulseResetButton: (value: boolean) => void;
};

export const RestartHint: React.FC<RestartHintProps> = ({ setPulseResetButton }) => {
  return (
    <b
      onMouseEnter={() => setPulseResetButton(true)}
      onMouseLeave={() => setPulseResetButton(false)}
      style={{ cursor: 'help' }}
    >
      Restart
    </b>
  );
};

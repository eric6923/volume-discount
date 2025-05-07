import { ActiveDatesCard } from "@shopify/discount-app-components";

export interface ActiveDatesProps {
  startTime: string;
  setStartTime: React.Dispatch<React.SetStateAction<string>>;
  endTime: string | null;
  setEndTime: React.Dispatch<React.SetStateAction<string | null>>;
}

const ActiveDates = (props: ActiveDatesProps) => {
  const { startTime, setStartTime, endTime, setEndTime } = props;

  return (
    <ActiveDatesCard
      startDate={{
        value: startTime,
        onChange: setStartTime,
      }}
      endDate={{
        value: endTime,
        onChange: setEndTime,
      }}
      timezoneAbbreviation="UTC"
    />
  );
};

export default ActiveDates;

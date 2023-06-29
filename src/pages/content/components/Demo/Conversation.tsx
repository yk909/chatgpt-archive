import { CHATGPT_DOMAIN_URL, styles } from "@src/constants";
import { Conversation } from "@src/types";
import { formatDates } from "@src/utils";
import { CheckboxInput } from "./Input";
import { useSelection } from "./context";

export function Item({
  data,
  active,
}: {
  data: Conversation;
  active: boolean;
}) {
  const { toggle, isSelected, enabled } = useSelection();
  const selected = isSelected(data.id);
  const handleToggle = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggle(data.id);
  };
  return (
    <div
      className={
        "flex rounded-lg gap-3 trans " +
        (active ? "bg-dark-1" : "hover:bg-card-hover")
      }
      style={{
        padding: styles.P_PAGE,
      }}
    >
      <div className="flex flex-none fcenter">
        {!enabled ? (
          <div className="relative group fcenter">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute w-4 h-4 group-hover:opacity-0 trans"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <CheckboxInput
              id={"c-" + data.id}
              checked={selected}
              className="z-10 opacity-0 group-hover:opacity-100"
              onClick={handleToggle}
            />
          </div>
        ) : (
          <CheckboxInput
            id={"c-" + data.id}
            checked={selected}
            onClick={handleToggle}
          />
        )}
      </div>
      <div
        className="flex-col flex-1 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = `${CHATGPT_DOMAIN_URL}/c/${data.id}`;
        }}
      >
        <div
          className="text-sm font-medium"
          dangerouslySetInnerHTML={{ __html: data.title }}
        ></div>
        <div
          className="text-gray-500"
          style={{
            fontSize: "12px",
          }}
        >
          Last update: {formatDates(data.update_time)}
        </div>
      </div>
    </div>
  );
}

export function List({
  data,
  currentId,
}: {
  data: Conversation[];
  currentId: string;
}) {
  return (
    <div className="flex flex-col w-full">
      {data.map((item) => (
        <Item key={item.id} data={item} active={currentId === item.id} />
      ))}
    </div>
  );
}

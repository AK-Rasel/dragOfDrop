import { useEffect, useState } from "react";
import { FaFire } from "react-icons/fa";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
export const App = () => {
  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board />
    </div>
  );
};
// full display
const Board = () => {
  const [cards, setCards] = useState([]); //Data
  const [hasChecked, setHasChecked] = useState(false);
  useEffect(() => {
    hasChecked && localStorage.setItem("cards", JSON.stringify(cards));
  }, [cards]);
  useEffect(() => {
    const cardData = localStorage.getItem("cards");
    setCards(cardData ? JSON.parse(cardData) : []);

    setHasChecked(true);
  }, []);

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12">
      <Column
        title="Backlog"
        headingColor="text-neutral-500"
        column="backlog"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="TODO"
        headingColor="text-yellow-200"
        column="todo"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="In progress"
        headingColor="text-blue-200"
        column="doing"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="Complete"
        headingColor="text-emerald-200"
        column="done"
        cards={cards}
        setCards={setCards}
      />
      <BurnCard setCards={setCards} />
    </div>
  );
};
// section
const Column = ({ title, headingColor, column, cards, setCards }) => {
  const [active, setActive] = useState(false);
  const filteredCards = cards.filter((c) => c.column === column);
  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id); // id
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    highLiteIndicator(e);
    setActive(true);
  };
  const handleDragLive = () => {
    setActive(false);
    clearHighLight();
  };
  const handleDragEnd = (e) => {
    e.preventDefault();
    setActive(false);
    clearHighLight();
    const cardId = e.dataTransfer.getData("cardId"); //getId
    const indicators = getIndicators();
    const { element } = grtNearestIndicator(e, indicators);
    const before = element.dataset.before || "-1";
    if (before !== cardId) {
      let copy = [...cards];
      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };
      copy = copy.filter((c) => c.id !== cardId);
      const moveToBack = before === "-1";
      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insetAtInbox = copy.findIndex((el) => el.id === before);
        if (insetAtInbox === undefined) {
          return;
        }
        copy.splice(insetAtInbox, 0, cardToTransfer);
      }
      setCards(copy);
    }
  };
  const highLiteIndicator = (e) => {
    const indicators = getIndicators();
    clearHighLight(indicators);
    const el = grtNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  };
  const grtNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );
    return el;
  };
  const clearHighLight = (els) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };
  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column='${column}']`));
  };

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>
          <span className="rounded mr-4 text-sm text-neutral-400">
            {filteredCards.length}
          </span>
          {title}
        </h3>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLive}
        onDrop={handleDragEnd}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => {
          return <Card key={c.id} {...c} handleDragStart={handleDragStart} />;
        })}
        <DropInDicator beforeId="-1" column={column} />
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};
// card
const Card = ({ title, id, column, handleDragStart }) => {
  return (
    <>
      <DropInDicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
      >
        <p className="text-sm text-neutral-100">{title}</p>
      </motion.div>
    </>
  );
};

const DropInDicator = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    ></div>
  );
};

const BurnCard = ({ setCards }) => {
  const [active, setActive] = useState(false);
  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };
  const handleDragLive = () => {
    setActive(false);
  };
  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    setCards((pv) => pv.filter((c) => c.id !== cardId));
    setActive(false);
  };
  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLive}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-red-800 bd-red-800/20 text-red-500 "
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(text);
    console.log(text.trim().length);
    if (!text.trim().length) return;
    const newCard = {
      column,
      title: text.trim(),
      id: Math.random().toString(),
    };
    console.log(newCard);
    setCards((pv) => [...pv, newCard]);
    setAdding(false);
  };
  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="add new task..."
            className="w-full rounded border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
          />
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
            >
              <span> Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  );
};

const DEFAULT_CARDS = [
  // BACKLOG
  { title: "Look into render bug in dashboard", id: "1", column: "backlog" },
  { title: "SOX compliance checklist", id: "2", column: "backlog" },
  { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog" },
  { title: "Document Notifications service", id: "4", column: "backlog" },
  // TO do
  {
    title: "Research DB options for new microservice",
    id: "5",
    column: "todo",
  },
  { title: "Postmortem for outage", id: "6", column: "todo" },
  { title: "Sync with product on Q3 roadmap", id: "7", column: "todo" },

  // DOING
  {
    title: "Refactor context providers to use Zustand",
    id: "8",
    column: "doing",
  },
  { title: "Add logging to daily CRON", id: "9", column: "doing" },
  // DONE
  {
    title: "Set up DD dashboards for Lambda listener",
    id: "10",
    column: "done",
  },
];

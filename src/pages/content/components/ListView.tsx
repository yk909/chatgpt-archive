import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { PrimitiveAtom, useAtom } from "jotai";

const PAGE_SIZE = 50;

function useLoadMoreLine(onChange, options) {
  const ref = useRef();

  const _callback = (entries) => {
    const [entry] = entries;
    onChange(entry.isIntersecting);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(_callback, options);
    console.log("useEffect, create observer", observer);

    if (ref.current) {
      console.log("observe ref");
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        console.log("unobserve ref");
        observer.unobserve(ref.current);
      }
    };
  }, [ref.current]);

  return ref;
}

export function ListView({
  dataAtom,
  id,
  renderData,
  renderSelectionBar,
}: {
  dataAtom: PrimitiveAtom<any[]>;
  id: string;
  renderData: (data: any) => React.ReactNode;
  renderSelectionBar?: ({
    selection,
    setSelection,
  }: {
    selection: Set<string>;
    setSelection: React.Dispatch<React.SetStateAction<Set<string>>>;
  }) => React.ReactNode;
}) {
  const [state, setState] = useState({
    page: 1,
    loadingMore: false,
  });
  const [displayData, setDiaplayData] = useState([]);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [data] = useAtom(dataAtom);

  console.log("[render] list view", { displayData, state, data });

  const handleLoadMore = (isIntersecting: boolean) => {
    console.log("start handleLoadMore, intersecting:", isIntersecting);
    if (isIntersecting && !state.loadingMore) {
      console.log("load more page");

      // trigger load more event
      setState((p) => ({
        loadingMore: true,
        page: p.page + 1,
      }));
    }
  };

  // console.log("render list view", { selection });

  const toggle = useCallback((id: string) => {
    console.log("toggle", { id, selection });
    setSelection((prev) => {
      const next = new Set(prev);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const ref = useLoadMoreLine(handleLoadMore, {
    root: document.querySelector("#" + id),
    margin: 0,
  });

  function setDisplayDataToPage(page: number) {
    setDiaplayData(() => [...data.slice(0, page * PAGE_SIZE)]);
  }

  const items = useMemo(() => {
    return renderData({ data: displayData, selection, setSelection, toggle });
  }, [displayData, selection]);

  useEffect(() => {
    console.log("list view state changed", state);

    // handle load more event
    if (state.loadingMore) {
      setDisplayDataToPage(state.page);
    }
  }, [state]);

  useEffect(() => {
    setDisplayDataToPage(1);
  }, [data]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-scroll" id={id}>
      {/* {renderData({ data: displayData, selection, setSelection, toggle })} */}
      {items}
      <div className="flex-none w-full h-12"></div>
      <div className="flex-none w-full h-8" ref={ref}></div>
      {renderSelectionBar && renderSelectionBar({ selection, setSelection })}
    </div>
  );
}

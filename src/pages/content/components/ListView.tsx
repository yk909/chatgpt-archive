import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { Spinner } from "@src/components/Spinner";
import { SelectionActionBar } from "@src/pages/content/components/SelectionActionBar";

const PAGE_SIZE = 20;

function useLoadMoreLine(onChange, options) {
  const ref = useRef();

  const _callback = (entries) => {
    const [entry] = entries;
    onChange(entry.isIntersecting);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(_callback, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref.current]);

  return ref;
}

export function ListView({
  dataAtom,
  id,
  fetchMore,
  fetch_message_type,
  append_message_type,
  renderData,
}: {
  dataAtom: any;
  id: string;
  fetch_message_type?: string;
  append_message_type?: string;
  fetchMore: (page: number, pageSize: number) => void;
  renderData: (data: any) => React.ReactNode;
}) {
  const [state, setState] = useState({
    loading: false,
    page: 1,
    loadingMore: false,
  });
  const [selection, setSelection] = useState(new Set());
  const [data, setData] = useAtom(dataAtom);

  console.log("[render] list view", state);

  const handleLoadMore = (isIntersecting: boolean) => {
    console.log("start handleLoadMore", state);
    if (isIntersecting && !state.loading && !state.loadingMore) {
      console.log("load more page");
      setState((p) => ({
        loading: false,
        loadingMore: true,
        page: p.page + 1,
      }));
    }
  };

  function toggle(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (selection.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const ref = useLoadMoreLine(handleLoadMore, {
    root: document.querySelector("#" + id),
    margin: 0,
  });

  useEffect(() => {
    console.log("list view state changed", state);
    if (state.loadingMore) {
      fetchMore(state.page, PAGE_SIZE);
    }
  }, [state]);

  useEffect(() => {
    const eventHandler = (request, sender, sendResponse) => {
      if (fetch_message_type && request.type === fetch_message_type) {
        setData(request.data);
        setState(() => ({
          loading: false,
          loadingMore: false,
          page: 1,
        }));
      } else if (append_message_type && request.type === append_message_type) {
        console.log("append message, data:", request.data);
        setData((p) => [...p, ...request.data]);
        setState((p) => ({
          loadingMore: false,
          loading: false,
          page: p.page,
        }));
      }
    };
    chrome.runtime.onMessage.addListener(eventHandler);

    setTimeout(() => {
      console.log("set loading to true");
      // setState(p => ({
      //   ...p,
      //   loading: true
      // }));
    }, 3333);

    setTimeout(() => {
      console.log("set loading to false");
      // setState(p => ({
      //   ...p,
      //   loading: false
      // }));
    }, 5555);

    if (data.length === 0) {
      fetchMore(1, PAGE_SIZE);
    }

    return () => {
      chrome.runtime.onMessage.removeListener(eventHandler);
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 relative" id={id}>
      {state.loading ? <Spinner /> : (
        <>
          <div className="flex-1 min-h-0 overflow-y-scroll">
            {renderData({ data, selection, setSelection, toggle })}
            <div className="w-full h-8 flex-none" ref={ref}></div>
          </div>
          {state.loadingMore && <Spinner />}
        </>
      )}
      <SelectionActionBar
        enabled={selection.size !== 0}
        handleClear={() => setSelection(new Set())}
        handleSelectAll={() => {
          setSelection(
            new Set(data.map((c: any) => c.id)),
          );
        }}
      />
    </div>
  );
}

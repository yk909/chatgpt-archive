import { Input } from "@src/components/ui/input";
import { useAtom } from "jotai";
import React from "react";
import { useForm } from "react-hook-form";
import { loadingAtom } from "@src/pages/content/context";

type SearchFormValues = {
  term: string;
};

function SearchForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>();
  const [loading, setLoading] = useAtom(loadingAtom);

  const onSubmit = (data: SearchFormValues) => {
    data.term = data.term.trim();
    setLoading(true);
    if (data.term === "") {
      return;
    }
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <Input {...register("term", { required: true })} />
    </form>
  );
}

export function SearchPage() {
  return (
    <div>
      <SearchForm />
    </div>
  );
}

import { Input } from "@src/components/ui/input";
import { useForm } from "react-hook-form";
import { useRefresh } from "../hook";

type SearchFormValues = {
  term: string;
};

function SearchForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>();
  const { triggerRefresh } = useRefresh();

  const onSubmit = (data: SearchFormValues) => {
    data.term = data.term.trim();
    triggerRefresh();
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

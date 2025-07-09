import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { PlusIcon } from "lucide-react";

export interface GoalFormValues {
  title: string;
  description: string;
}

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormValues) => void;
  initialValues?: GoalFormValues;
  //   isEdit?: boolean;
}

const GoalModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: GoalModalProps) => {
  const { register, handleSubmit, reset } = useForm<GoalFormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    } else {
      reset({ title: "", description: "" });
    }
  }, [initialValues, reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="bg-brand text-white text-sm flex gap-1 items-center px-3 py-2 rounded-lg">
          <PlusIcon size={20} />
          Novo Objetivo
        </button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle>Adicionar Objetivo</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo objetivo.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-col gap-1">
            <p>Título do Objetivo</p>
            <input
              {...register("title", { required: true })}
              maxLength={100}
              className="bg-white border rounded-md h-10 p-2 font-normal focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Digite seu objetivo"
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <p>Descrição do Objetivo</p>
            <input
              {...register("description", { required: false })}
              maxLength={250}
              className="bg-white border rounded-md h-10 p-2 font-normal focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Digite uma descrição"
            />
          </div>

          <DialogFooter>
            <button
              type="submit"
              className="bg-brand text-white px-4 py-2 rounded-md"
            >
              Salvar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;

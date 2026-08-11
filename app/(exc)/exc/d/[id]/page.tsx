import ExcalidrawEditor from "@/components/exc/ExcalidrawEditor";

export default function ExcEditorPage({ params }: { params: { id: string } }) {
  return <ExcalidrawEditor id={params.id} />;
}

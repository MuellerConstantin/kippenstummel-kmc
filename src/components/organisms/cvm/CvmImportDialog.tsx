import { useMemo, useState, useCallback } from "react";
import { DialogProps, Heading } from "react-aria-components";
import { Dialog } from "@/components/atoms/Dialog";
import { Select, SelectItem } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { TextArea } from "@/components/atoms/TextArea";
import { TextField } from "@/components/atoms/TextField";
import { NumberField } from "@/components/atoms/NumberField";

interface CvmImportFormProps {
  onImport: () => void;
  onClose: () => void;
}

function CvmImportForm(props: CvmImportFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <TextField label="Latitude" />
        <TextField label="Longitude" />
        <NumberField label="Score" step={0.1} minValue={-5} maxValue={5} />
      </div>
      <div className="flex justify-start gap-4">
        <Button variant="secondary" onPress={props.onClose} className="w-full">
          Cancel
        </Button>
        <Button onPress={props.onImport} className="w-full">
          Import
        </Button>
      </div>
    </div>
  );
}

interface CvmImportJsonProps {
  onImport: () => void;
  onClose: () => void;
}

function CvmImportJson(props: CvmImportJsonProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <TextArea rows={10} />
      </div>
      <div className="flex justify-start gap-4">
        <Button variant="secondary" onPress={props.onClose} className="w-full">
          Cancel
        </Button>
        <Button onPress={props.onImport} className="w-full">
          Import
        </Button>
      </div>
    </div>
  );
}

interface CvmImportOsmProps {
  onImport: () => void;
  onClose: () => void;
}

function CvmImportOsm(props: CvmImportOsmProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <TextField label="Region" />
      </div>
      <div className="flex justify-start gap-4">
        <Button variant="secondary" onPress={props.onClose} className="w-full">
          Cancel
        </Button>
        <Button onPress={props.onImport} className="w-full">
          Import
        </Button>
      </div>
    </div>
  );
}

interface CvmImportDialogProps extends Omit<DialogProps, "children"> {
  onConfirm?: () => void;
}

export function CvmImportDialog(props: CvmImportDialogProps) {
  const [isLoading] = useState(false);

  const importOptions = useMemo(
    () => [
      { label: "Form (Manually)", value: "form" },
      { label: "JSON (Manually)", value: "json" },
      { label: "OSM (Automatically)", value: "osm" },
    ],
    [],
  );

  const [selectedOption, setSelectedOption] = useState<string>(
    `import-select-${importOptions[0].value}`,
  );

  const onFormImport = useCallback((close: () => void) => {
    close();
  }, []);

  const onJsonImport = useCallback((close: () => void) => {
    close();
  }, []);

  const onOsmImport = useCallback((close: () => void) => {
    close();
  }, []);

  return (
    <Dialog {...props}>
      {({ close }) => (
        <>
          <Heading
            slot="title"
            className="my-0 text-xl leading-6 font-semibold"
          >
            Import CVM
          </Heading>
          <div className="mt-4 flex flex-col gap-4">
            <Select
              label="Import Method"
              isDisabled={isLoading}
              items={importOptions}
              selectedKey={selectedOption}
              onSelectionChange={(property) =>
                setSelectedOption(property as string)
              }
            >
              {importOptions.map((option) => (
                <SelectItem
                  id={`import-select-${option.value}`}
                  key={option.value}
                  textValue={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            {selectedOption === "import-select-form" && (
              <CvmImportForm
                onClose={close}
                onImport={() => onFormImport(close)}
              />
            )}
            {selectedOption === "import-select-json" && (
              <CvmImportJson
                onClose={close}
                onImport={() => onJsonImport(close)}
              />
            )}
            {selectedOption === "import-select-osm" && (
              <CvmImportOsm
                onClose={close}
                onImport={() => onOsmImport(close)}
              />
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}

import { useMemo, useState, useCallback } from "react";
import {
  DialogProps,
  DropZone,
  FileTrigger,
  Heading,
  Text,
} from "react-aria-components";
import { Formik, FormikHelpers } from "formik";
import axios from "axios";
import * as yup from "yup";
import { Form } from "@/components/atoms/Form";
import { Dialog } from "@/components/atoms/Dialog";
import { Select, SelectItem } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { TextArea } from "@/components/atoms/TextArea";
import { TextField } from "@/components/atoms/TextField";
import { NumberField } from "@/components/atoms/NumberField";
import useApi from "@/hooks/useApi";
import { constraintMessages } from "@/api";
import { Spinner } from "@/components/atoms/Spinner";
import { SearchableSelect } from "@/components/atoms/SearchableSelect";
import useSWR from "swr";

interface CvmImportFormProps {
  close: () => void;
}

function CvmImportForm(props: CvmImportFormProps) {
  const { close } = props;

  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = yup.object().shape({
    longitude: yup
      .number()
      .typeError("Longitude must be a number")
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .required("Is required"),
    latitude: yup
      .number()
      .typeError("Latitude must be a number")
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .required("Is required"),
    score: yup
      .number()
      .min(-5, "Score must be between -5 and 5")
      .max(5, "Score must be between -5 and 5")
      .optional(),
  });

  const onImport = useCallback(
    (
      {
        longitude,
        latitude,
        score,
      }: {
        longitude: string;
        latitude: string;
        score?: number;
      },
      {
        setFieldError,
      }: FormikHelpers<{
        longitude: string;
        latitude: string;
        score?: number;
      }>,
    ) => {
      setIsLoading(true);
      setError(null);

      api
        .post("/kmc/cvms/import/manual", {
          cvms: [
            {
              longitude: parseFloat(longitude),
              latitude: parseFloat(latitude),
              score,
            },
          ],
        })
        .then(close)
        .catch((err) => {
          if (err.response && err.response.status === 422) {
            err.response.data.details?.forEach(
              (detail: {
                property: string;
                constraint: string;
                message: string;
              }) =>
                setFieldError(
                  detail.property,
                  constraintMessages.get(detail.message) ||
                    "Server side validation failed for this field",
                ),
            );
          } else {
            setError("An unexpected error occurred, please retry!");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [close, api],
  );

  return (
    <div className="flex flex-col gap-4">
      <Formik<{ longitude: string; latitude: string; score?: number }>
        initialValues={{ longitude: "", latitude: "", score: undefined }}
        validationSchema={schema}
        onSubmit={(values, actions) => onImport(values, actions)}
      >
        {(props) => (
          <Form onSubmit={props.handleSubmit} validationBehavior="aria">
            {error && <p className="text-center text-red-500">{error}</p>}
            <TextField
              label="Latitude"
              name="latitude"
              type="text"
              value={props.values.latitude}
              onBlur={props.handleBlur}
              isDisabled={isLoading}
              onChange={(value) => props.setFieldValue("latitude", value)}
              isInvalid={!!props.touched.latitude && !!props.errors.latitude}
              errorMessage={props.errors.latitude}
            />
            <TextField
              label="Longitude"
              name="longitude"
              type="text"
              value={props.values.longitude}
              onBlur={props.handleBlur}
              onChange={(value) => props.setFieldValue("longitude", value)}
              isInvalid={!!props.touched.longitude && !!props.errors.longitude}
              errorMessage={props.errors.longitude}
            />
            <NumberField
              label="Score"
              step={0.1}
              minValue={-5}
              maxValue={5}
              name="score"
              value={props.values.score}
              onBlur={props.handleBlur}
              onChange={(value) => props.setFieldValue("score", value)}
              isInvalid={!!props.touched.score && !!props.errors.score}
              errorMessage={props.errors.score}
            />
            <div className="flex justify-start gap-4">
              <Button variant="secondary" onPress={close} className="w-full">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex w-full justify-center"
                isDisabled={!(props.isValid && props.dirty) || isLoading}
              >
                {!isLoading && <span>Import</span>}
                {isLoading && <Spinner />}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

interface CvmImportJsonProps {
  close: () => void;
}

function CvmImportJson(props: CvmImportJsonProps) {
  const { close } = props;

  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const arraySchema = yup.array().of(
    yup.object({
      longitude: yup
        .number()
        .typeError("Longitude must be a number")
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .required("Is required"),
      latitude: yup
        .number()
        .typeError("Latitude must be a number")
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .required("Is required"),
      score: yup
        .number()
        .min(-5, "Score must be between -5 and 5")
        .max(5, "Score must be between -5 and 5")
        .optional(),
    }),
  );

  const schema = yup.object().shape({
    data: yup
      .string()
      .required("Is required")
      .test("is-valid-json", "Is not valid JSON", (value) => {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      })
      .test("is-array-of-objects", "Must be an array of objects", (value) => {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) return false;

          return true;
        } catch {
          return false;
        }
      })
      .test("is-valid-items", "Must be valid items", (value) => {
        try {
          const parsed = JSON.parse(value);
          return arraySchema.isValidSync(parsed);
        } catch {
          return false;
        }
      }),
  });

  const onImport = useCallback(
    ({ data }: { data: string }) => {
      const parsed = JSON.parse(data) as Array<{
        longitude: number;
        latitude: number;
        score?: number;
      }>;

      setIsLoading(true);
      setError(null);

      api
        .post("/kmc/cvms/import/manual", {
          cvms: parsed,
        })
        .then(close)
        .catch(() => {
          setError("An unexpected error occurred, please retry!");
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [close, api],
  );

  return (
    <div className="flex flex-col gap-4">
      <Formik<{ data: string }>
        initialValues={{ data: "" }}
        validationSchema={schema}
        onSubmit={(values) => onImport(values)}
      >
        {(props) => (
          <Form onSubmit={props.handleSubmit} validationBehavior="aria">
            {error && <p className="text-center text-red-500">{error}</p>}
            <TextArea
              label="Data"
              name="data"
              placeholder={
                '[\n\t{\n\t\t"latitude": 49.0109602,\n\t\t"longitude": 8.4082742,\n\t\t"score": 2\n\t}\n]'
              }
              value={props.values.data}
              onBlur={props.handleBlur}
              isDisabled={isLoading}
              onChange={(value) => props.setFieldValue("data", value)}
              isInvalid={!!props.touched.data && !!props.errors.data}
              errorMessage={props.errors.data}
              rows={10}
            />
            <div className="flex justify-start gap-4">
              <Button variant="secondary" onPress={close} className="w-full">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex w-full justify-center"
                isDisabled={!(props.isValid && props.dirty) || isLoading}
              >
                {!isLoading && <span>Import</span>}
                {isLoading && <Spinner />}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

interface CvmImportFileUploadProps {
  close: () => void;
}

function CvmImportFileUpload(props: CvmImportFileUploadProps) {
  const { close } = props;

  const api = useApi();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File>();

  const onImport = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", selectedFile!);

      api
        .post("/kmc/cvms/import/file", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(close);
    } catch {
      setError("An unexpected error occurred, please retry!");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, api, close]);

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-center text-red-500">{error}</p>}
      {selectedFile && (
        <TextField
          isReadOnly
          label="Selected file"
          value={selectedFile?.name}
        />
      )}
      {!selectedFile && (
        <div className="flex flex-col gap-4">
          <FileTrigger
            acceptedFileTypes={["application/json"]}
            onSelect={(files) => {
              if (files) {
                const file = files.item(0);

                if (file) {
                  setSelectedFile(file);
                }
              }
            }}
          >
            <Button variant="secondary">Select a file</Button>
          </FileTrigger>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 flex-1 border-t border-slate-600"></div>
            <span className="text-sm text-gray-600 uppercase">or</span>
            <div className="w-16 flex-1 border-t border-gray-600"></div>
          </div>
          <DropZone
            className="flex cursor-pointer flex-col items-center gap-4 rounded-md border border-slate-200 bg-slate-100 p-4 hover:border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            onDrop={async (event) => {
              if (event.items) {
                const item = event.items[0];

                if (item.kind === "file") {
                  const file = await item.getFile();

                  if (file) {
                    setSelectedFile(file);
                  }
                }
              }
            }}
          >
            <Text slot="label">Drop file here</Text>
          </DropZone>
        </div>
      )}
      <div className="flex justify-start gap-4">
        <Button variant="secondary" onPress={close} className="w-full">
          Cancel
        </Button>
        <Button
          onPress={onImport}
          className="flex w-full justify-center"
          isDisabled={isLoading || !selectedFile}
        >
          {!isLoading && <span>Import</span>}
          {isLoading && <Spinner />}
        </Button>
      </div>
    </div>
  );
}

interface CvmImportOsmProps {
  close: () => void;
}

function CvmImportOsm(props: CvmImportOsmProps) {
  const { close } = props;

  const api = useApi();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [osmSearchTerm, setOsmSearchTerm] = useState<string | null>(null);

  const schema = yup.object().shape({
    region: yup
      .object()
      .shape({
        id: yup.number().required("Is required"),
        name: yup.string().required("Is required"),
      })
      .required("Is required"),
  });

  const onImport = useCallback(
    ({ region }: { region: { id: number; name: string } | null }) => {
      setIsLoading(true);
      setError(null);

      api
        .post("/kmc/cvms/import/osm", {
          region: region!.name,
        })
        .then(close)
        .catch(() => setError("An unexpected error occurred, please retry!"))
        .finally(() => setIsLoading(false));
    },
    [api, close],
  );

  const defaultOsmSuggestions = useMemo<
    {
      place_id: number;
      licence: string;
      osm_id: number;
      osm_type: string;
      lat: string;
      lon: string;
      class: string;
      type: string;
      place_rank: number;
      importance: number;
      addresstype: string;
      name: string;
      display_name: string;
      boundingbox: string[];
    }[]
  >(
    () => [
      {
        place_id: 113453178,
        licence:
          "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
        osm_type: "relation",
        osm_id: 62518,
        lat: "49.0068705",
        lon: "8.4034195",
        class: "boundary",
        type: "administrative",
        place_rank: 12,
        importance: 0.6803002897297156,
        addresstype: "city",
        name: "Karlsruhe",
        display_name: "Karlsruhe, Baden-Württemberg, Deutschland",
        boundingbox: ["48.9404699", "49.0912838", "8.2773142", "8.5417299"],
      },
    ],
    [],
  );

  const fetchOsmSuggestions = useCallback(async (region: string) => {
    const url = "https://nominatim.openstreetmap.org/search";

    return await axios.get(url, {
      params: {
        q: region,
        format: "json",
        limit: 10,
      },
      headers: {
        Accept: "application/json",
      },
    });
  }, []);

  const { data: osmSuggestions } = useSWR<
    {
      place_id: number;
      licence: string;
      osm_id: number;
      osm_type: string;
      lat: string;
      lon: string;
      class: string;
      type: string;
      place_rank: number;
      importance: number;
      addresstype: string;
      name: string;
      display_name: string;
      boundingbox: string[];
    }[],
    unknown,
    string | null
  >(osmSearchTerm, (key) => fetchOsmSuggestions(key).then((res) => res.data));

  return (
    <div className="flex flex-col gap-4">
      <Formik<{ region: { id: number; name: string } | null }>
        initialValues={{ region: null }}
        validationSchema={schema}
        onSubmit={(values) => onImport(values)}
      >
        {(props) => (
          <Form onSubmit={props.handleSubmit} validationBehavior="aria">
            {error && <p className="text-center text-red-500">{error}</p>}
            <SearchableSelect
              label="Region"
              items={osmSuggestions || defaultOsmSuggestions}
              onSearch={(searchTerm) => setOsmSearchTerm(searchTerm)}
              selectedKey={
                props.values.region
                  ? `osm-select-${props.values.region.id}`
                  : null
              }
              onSelectionChange={(key) => {
                const found = (osmSuggestions || defaultOsmSuggestions)?.find(
                  (suggestion) => `osm-select-${suggestion.osm_id}` === key,
                );
                props.setFieldValue("region", {
                  id: found!.osm_id,
                  name: found!.display_name,
                });
              }}
              errorMessage={props.errors.region}
              isInvalid={!!props.touched.region && !!props.errors.region}
              onBlur={props.handleBlur}
              isDisabled={isLoading}
              name="region"
            >
              {(osmSuggestions || defaultOsmSuggestions).map((option) => (
                <SelectItem
                  id={`osm-select-${option.osm_id}`}
                  key={option.osm_id}
                  textValue={option.display_name}
                >
                  {option.display_name}
                </SelectItem>
              ))}
            </SearchableSelect>
            <div className="flex justify-start gap-4">
              <Button variant="secondary" onPress={close} className="w-full">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex w-full justify-center"
                isDisabled={!(props.isValid && props.dirty) || isLoading}
              >
                {!isLoading && <span>Import</span>}
                {isLoading && <Spinner />}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
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
      { label: "Form", value: "form" },
      { label: "JSON", value: "json" },
      { label: "File Upload", value: "file" },
      { label: "OpenStreetMap", value: "osm" },
    ],
    [],
  );

  const [selectedOption, setSelectedOption] = useState<string>(
    `import-select-${importOptions[0].value}`,
  );

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
              <CvmImportForm close={close} />
            )}
            {selectedOption === "import-select-json" && (
              <CvmImportJson close={close} />
            )}
            {selectedOption === "import-select-file" && (
              <CvmImportFileUpload close={close} />
            )}
            {selectedOption === "import-select-osm" && (
              <CvmImportOsm close={close} />
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}

import { useMemo, useState, useCallback } from "react";
import { DialogProps, Heading } from "react-aria-components";
import { Formik, FormikHelpers } from "formik";
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

interface CvmImportOsmProps {
  close: () => void;
}

function CvmImportOsm(props: CvmImportOsmProps) {
  const { close } = props;

  const api = useApi();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = yup.object().shape({
    region: yup.string().required("Is required"),
  });

  const onImport = useCallback(
    ({ region }: { region: string }) => {
      setIsLoading(true);
      setError(null);

      api
        .post("/kmc/cvms/import/osm", {
          region,
        })
        .then(close)
        .catch(() => setError("An unexpected error occurred, please retry!"))
        .finally(() => setIsLoading(false));
    },
    [api, close],
  );

  return (
    <div className="flex flex-col gap-4">
      <Formik<{ region: string }>
        initialValues={{ region: "" }}
        validationSchema={schema}
        onSubmit={(values) => onImport(values)}
      >
        {(props) => (
          <Form onSubmit={props.handleSubmit} validationBehavior="aria">
            {error && <p className="text-center text-red-500">{error}</p>}
            <div className="flex items-end gap-4">
              <TextField
                label="Region"
                name="region"
                type="text"
                className="grow"
                value={props.values.region}
                onBlur={props.handleBlur}
                isDisabled={isLoading}
                onChange={(value) => props.setFieldValue("region", value)}
                isInvalid={!!props.touched.region && !!props.errors.region}
                errorMessage={props.errors.region}
              />
              <div className="flex justify-start gap-4">
                <Button variant="secondary" onPress={close} className="w-full">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex w-full justify-center"
                  isDisabled={isLoading}
                >
                  {!isLoading && <span>Import</span>}
                  {isLoading && <Spinner />}
                </Button>
              </div>
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
      { label: "Form (Manually)", value: "form" },
      { label: "JSON (Manually)", value: "json" },
      { label: "OSM (Automatically)", value: "osm" },
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
            {selectedOption === "import-select-osm" && (
              <CvmImportOsm close={close} />
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}

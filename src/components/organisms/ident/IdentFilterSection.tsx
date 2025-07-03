import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Formik } from "formik";
import { Form } from "@/components/atoms/Form";
import { NumberField } from "@/components/atoms/NumberField";
import { Button } from "@/components/atoms/Button";
import { DatePicker } from "@/components/atoms/DatePicker";
import { DateValue } from "react-aria-components";

interface IdentFilterSectionProps {
  isDisabled?: boolean;
  onFilter?: (query: string | null) => void;
}

export function IdentFilterSection(props: IdentFilterSectionProps) {
  const { onFilter } = props;

  const [showMore, setShowMore] = useState(false);

  const [searchProperty, setSearchProperty] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [numberOfFilters, setNumberOfFilters] = useState(0);
  const [filteredMinCredibility, setFilteredMinCredibility] = useState<
    number | null
  >(null);
  const [filteredMaxCredibility, setFilteredMaxCredibility] = useState<
    number | null
  >(null);
  const [filteredIssuedBefore, setFilteredIssuedBefore] = useState<Date | null>(
    null,
  );
  const [filteredIssuedAfter, setFilteredIssuedAfter] = useState<Date | null>(
    null,
  );

  const searchQuery = useMemo(() => {
    if (searchProperty && searchTerm && searchTerm.length > 0) {
      return `${searchProperty}=like="${searchTerm}"`;
    } else {
      return null;
    }
  }, [searchProperty, searchTerm]);

  const onFilterInternal = useCallback(
    ({
      minCredibility,
      maxCredibility,
      issuedBefore,
      issuedAfter,
    }: {
      minCredibility: number | null;
      maxCredibility: number | null;
      issuedBefore: DateValue | null;
      issuedAfter: DateValue | null;
    }) => {
      setFilteredMinCredibility(minCredibility);
      setFilteredMaxCredibility(maxCredibility);
      setFilteredIssuedBefore(issuedBefore ? issuedBefore.toDate("UTC") : null);
      setFilteredIssuedAfter(issuedAfter ? issuedAfter.toDate("UTC") : null);
    },
    [
      setFilteredMinCredibility,
      setFilteredMaxCredibility,
      setFilteredIssuedBefore,
      setFilteredIssuedAfter,
    ],
  );

  const onFilterReset = useCallback((resetForm: () => void) => {
    setFilteredMinCredibility(null);
    setFilteredMaxCredibility(null);
    setFilteredIssuedBefore(null);
    setFilteredIssuedAfter(null);
    resetForm();
  }, []);

  useEffect(() => {
    if (onFilter) {
      const minCredibilityQuery =
        filteredMinCredibility !== null
          ? `credibility>=${filteredMinCredibility}`
          : null;

      const maxCredibilityQuery =
        filteredMaxCredibility !== null
          ? `credibility<=${filteredMaxCredibility}`
          : null;

      const issuedBeforeQuery =
        filteredIssuedBefore !== null
          ? `createdAt<=${filteredIssuedBefore.toISOString()}`
          : null;

      const issuedAfterQuery =
        filteredIssuedAfter !== null
          ? `createdAt>=${filteredIssuedAfter.toISOString()}`
          : null;

      const appliedFilters = [
        minCredibilityQuery,
        maxCredibilityQuery,
        issuedBeforeQuery,
        issuedAfterQuery,
      ].filter(Boolean);

      setNumberOfFilters(appliedFilters.length);

      const query = [searchQuery, ...appliedFilters]
        .filter(Boolean)
        .join(" and ");

      console.log(query);
      onFilter(query ? encodeURIComponent(query) : null);
    }
  }, [
    searchQuery,
    filteredMinCredibility,
    filteredMaxCredibility,
    filteredIssuedBefore,
    filteredIssuedAfter,
    onFilter,
  ]);

  return (
    <div className="flex grow flex-col gap-2">
      <SearchBar
        isReadOnly={props.isDisabled}
        onSearch={(property, searchTerm) => {
          setSearchProperty(property);
          setSearchTerm(searchTerm);
        }}
        properties={[{ label: "Identity", value: "identity" }]}
      />
      <div className="flex items-center gap-2">
        <button
          className="cursor-pointer text-xs text-green-600 hover:underline"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? (
            <div className="flex items-center gap-1">
              Less Filters <ChevronUp className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              More Filters <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </button>
        {numberOfFilters > 0 && (
          <div className="rounded-md bg-green-600 p-0.5 text-xs text-white">
            {numberOfFilters} {numberOfFilters > 1 ? "Filters" : "Filter"}{" "}
            applied
          </div>
        )}
      </div>
      <div className={showMore ? "block" : "hidden"}>
        <Formik<{
          minCredibility: number | null;
          maxCredibility: number | null;
          issuedBefore: DateValue | null;
          issuedAfter: DateValue | null;
        }>
          initialValues={{
            minCredibility: null,
            maxCredibility: null,
            issuedBefore: null,
            issuedAfter: null,
          }}
          onSubmit={(values) => onFilterInternal(values)}
        >
          {(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit} validationBehavior="aria">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                  <NumberField
                    className="grow"
                    label="Minimum credibility"
                    step={1}
                    minValue={0}
                    maxValue={100}
                    errorMessage={formikProps.errors.minCredibility}
                    isInvalid={
                      !!formikProps.touched.minCredibility &&
                      !!formikProps.errors.minCredibility
                    }
                    name="minCredibility"
                    value={formikProps.values.minCredibility}
                    onBlur={formikProps.handleBlur}
                    isDisabled={props.isDisabled}
                    onChange={(value) =>
                      formikProps.setFieldValue("minCredibility", value)
                    }
                  />
                  <NumberField
                    className="grow"
                    label="Maximum credibility"
                    step={1}
                    minValue={0}
                    maxValue={100}
                    errorMessage={formikProps.errors.maxCredibility}
                    isInvalid={
                      !!formikProps.touched.maxCredibility &&
                      !!formikProps.errors.maxCredibility
                    }
                    name="maxcredibility"
                    value={formikProps.values.maxCredibility}
                    onBlur={formikProps.handleBlur}
                    isDisabled={props.isDisabled}
                    onChange={(value) =>
                      formikProps.setFieldValue("maxCredibility", value)
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                  <DatePicker
                    className="grow"
                    label="Issued before"
                    name="issuedBefore"
                    isDisabled={props.isDisabled}
                    isRequired={false}
                    value={formikProps.values.issuedBefore}
                    onChange={(value) =>
                      formikProps.setFieldValue("issuedBefore", value)
                    }
                    errorMessage={formikProps.errors.issuedBefore}
                    isInvalid={
                      !!formikProps.touched.issuedBefore &&
                      !!formikProps.errors.issuedBefore
                    }
                    onBlur={formikProps.handleBlur}
                  />
                  <DatePicker
                    className="grow"
                    label="Issued after"
                    name="issuedAfter"
                    isDisabled={props.isDisabled}
                    isRequired={false}
                    value={formikProps.values.issuedAfter}
                    onChange={(value) =>
                      formikProps.setFieldValue("issuedAfter", value)
                    }
                    errorMessage={formikProps.errors.issuedAfter}
                    isInvalid={
                      !!formikProps.touched.issuedAfter &&
                      !!formikProps.errors.issuedAfter
                    }
                    onBlur={formikProps.handleBlur}
                  />
                </div>
              </div>
              <div className="flex justify-start gap-4">
                <Button
                  variant="secondary"
                  onPress={() => onFilterReset(formikProps.resetForm)}
                  className="w-full"
                  isDisabled={!formikProps.dirty || props.isDisabled}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="flex w-full justify-center"
                  isDisabled={
                    !(formikProps.isValid && formikProps.dirty) ||
                    props.isDisabled
                  }
                >
                  Apply
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

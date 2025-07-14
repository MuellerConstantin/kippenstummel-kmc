import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Formik } from "formik";
import { Form } from "@/components/atoms/Form";
import { NumberField } from "@/components/atoms/NumberField";
import { Button } from "@/components/atoms/Button";
import { DatePicker } from "@/components/atoms/DatePicker";
import { DateValue } from "react-aria-components";

interface CvmFilterSectionProps {
  isDisabled?: boolean;
  onFilter?: (query: string | null) => void;
}

export function CvmFilterSection(props: CvmFilterSectionProps) {
  const { onFilter } = props;

  const [showMore, setShowMore] = useState(false);

  const [searchProperty, setSearchProperty] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [numberOfFilters, setNumberOfFilters] = useState(0);
  const [filteredMinScore, setFilteredMinScore] = useState<number | null>(null);
  const [filteredMaxScore, setFilteredMaxScore] = useState<number | null>(null);
  const [filteredCreatedBefore, setFilteredCreatedBefore] =
    useState<Date | null>(null);
  const [filteredCreatedAfter, setFilteredCreatedAfter] = useState<Date | null>(
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
      minScore,
      maxScore,
      createdBefore,
      createdAfter,
    }: {
      minScore: number | null;
      maxScore: number | null;
      createdBefore: DateValue | null;
      createdAfter: DateValue | null;
    }) => {
      setFilteredMinScore(minScore);
      setFilteredMaxScore(maxScore);
      setFilteredCreatedBefore(
        createdBefore ? createdBefore.toDate("UTC") : null,
      );
      setFilteredCreatedAfter(createdAfter ? createdAfter.toDate("UTC") : null);
    },
    [
      setFilteredMinScore,
      setFilteredMaxScore,
      setFilteredCreatedBefore,
      setFilteredCreatedAfter,
    ],
  );

  const onFilterReset = useCallback((resetForm: () => void) => {
    setFilteredMinScore(null);
    setFilteredMaxScore(null);
    setFilteredCreatedBefore(null);
    setFilteredCreatedAfter(null);
    resetForm();
  }, []);

  useEffect(() => {
    if (onFilter) {
      const minScoreQuery =
        filteredMinScore !== null
          ? `score>=${Math.round(filteredMinScore)}`
          : null;

      const maxScoreQuery =
        filteredMaxScore !== null
          ? `score<=${Math.round(filteredMaxScore)}`
          : null;

      const createdBeforeQuery =
        filteredCreatedBefore !== null
          ? `createdAt<=${filteredCreatedBefore.toISOString()}`
          : null;

      const createdAfterQuery =
        filteredCreatedAfter !== null
          ? `createdAt>=${filteredCreatedAfter.toISOString()}`
          : null;

      const appliedFilters = [
        minScoreQuery,
        maxScoreQuery,
        createdBeforeQuery,
        createdAfterQuery,
      ].filter(Boolean);

      setNumberOfFilters(appliedFilters.length);

      const query = [searchQuery, ...appliedFilters]
        .filter(Boolean)
        .join(" and ");

      onFilter(query ? encodeURIComponent(query) : null);
    }
  }, [
    searchQuery,
    filteredMinScore,
    filteredMaxScore,
    filteredCreatedBefore,
    filteredCreatedAfter,
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
        properties={[{ label: "ID", value: "id" }]}
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
          minScore: number | null;
          maxScore: number | null;
          createdBefore: DateValue | null;
          createdAfter: DateValue | null;
        }>
          initialValues={{
            minScore: null,
            maxScore: null,
            createdBefore: null,
            createdAfter: null,
          }}
          onSubmit={(values) => onFilterInternal(values)}
        >
          {(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit} validationBehavior="aria">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                  <NumberField
                    className="grow"
                    label="Minimum score"
                    step={1}
                    minValue={-10}
                    maxValue={10}
                    errorMessage={formikProps.errors.minScore}
                    isInvalid={
                      !!formikProps.touched.minScore &&
                      !!formikProps.errors.minScore
                    }
                    name="minScore"
                    value={formikProps.values.minScore}
                    onBlur={formikProps.handleBlur}
                    isDisabled={props.isDisabled}
                    onChange={(value) =>
                      formikProps.setFieldValue("minScore", value)
                    }
                  />
                  <NumberField
                    className="grow"
                    label="Maximum score"
                    step={1}
                    minValue={-10}
                    maxValue={10}
                    errorMessage={formikProps.errors.maxScore}
                    isInvalid={
                      !!formikProps.touched.maxScore &&
                      !!formikProps.errors.maxScore
                    }
                    name="maxscore"
                    value={formikProps.values.maxScore}
                    onBlur={formikProps.handleBlur}
                    isDisabled={props.isDisabled}
                    onChange={(value) =>
                      formikProps.setFieldValue("maxScore", value)
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                  <DatePicker
                    className="grow"
                    label="Created before"
                    name="createdBefore"
                    isDisabled={props.isDisabled}
                    isRequired={false}
                    value={formikProps.values.createdBefore}
                    onChange={(value) =>
                      formikProps.setFieldValue("createdBefore", value)
                    }
                    errorMessage={formikProps.errors.createdBefore}
                    isInvalid={
                      !!formikProps.touched.createdBefore &&
                      !!formikProps.errors.createdBefore
                    }
                    onBlur={formikProps.handleBlur}
                  />
                  <DatePicker
                    className="grow"
                    label="Created after"
                    name="createdAfter"
                    isDisabled={props.isDisabled}
                    isRequired={false}
                    value={formikProps.values.createdAfter}
                    onChange={(value) =>
                      formikProps.setFieldValue("createdAfter", value)
                    }
                    errorMessage={formikProps.errors.createdAfter}
                    isInvalid={
                      !!formikProps.touched.createdAfter &&
                      !!formikProps.errors.createdAfter
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

import { Button, Icon, TextField } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
//@ts-ignore
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { ResourcePickerPropsType } from "./AppliesTo";

import styles from "../assets/BrowseQuery.module.css";

const BrowseQuery = (props: ResourcePickerPropsType) => {
  const { errors, initialQuery, setInitialQuery, toggle, setToggle } = props;

  const [query, setQuery] = useState<string>(props.initialQuery || "");

  const debouncedSetQuery = useCallback(
    _.debounce((value: string) => {
      setInitialQuery(value);
      setToggle(true);
    }, 1000),
    [setInitialQuery, setToggle],
  );

  useEffect(() => {
    if (query !== initialQuery) {
      debouncedSetQuery(query);
    }
    return () => debouncedSetQuery.cancel();
  }, [query, debouncedSetQuery]);

  return (
    <div className={styles.BrowseQuery}>
      <div className={styles.BrowseQuery__textfield}>
        <TextField
          label={"browse"}
          labelHidden
          prefix={<Icon source={SearchIcon} />}
          value={query}
          onChange={(value) => setQuery(value)}
          error={errors && errors.selectedAppliesTo}
          placeholder="Search products"
          autoComplete="off"
        />
      </div>

      <Button
        size="large"
        onClick={() => {
          setInitialQuery(query);
          setToggle(!toggle);
        }}
      >
        Browse
      </Button>
    </div>
  );
};

export default BrowseQuery;

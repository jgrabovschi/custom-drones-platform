<script setup>
import { ref, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { h } from 'vue'
import axios from 'axios'

const onSubmit = async values => {
  console.log(values);
  if (values.method === 'get') {
    await axios.get(values.url, {
      headers: {
        'X-Auth-Token': values.token
      }
    }).then(response => {
      console.log(response.data);
    }).catch(error => {
      console.log(error);
    });
  }else{
    console.log(JSON.parse(values.body));
    await axios.post(values.url, JSON.parse(values.body), {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      console.log(response.data);
    }).catch(error => {
      console.log(error);
    });
  }
}
</script>

<template>
  <div class="p-8 mx-auto max-w-3xl content-center" id="app">
    <!-- <Form @submit="onSubmit">
      <div class="flex space-x-4">
        <div class="flex-none w-48">
          <FormField v-slot="{ componentField }" name="method">
            <FormItem>
              <FormLabel>Method</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Method</SelectLabel>
                      <SelectItem value="get">
                        GET
                      </SelectItem>
                      <SelectItem value="post">
                        POST
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <div class="flex-1">
          <FormField v-slot="{ componentField }" name="url">
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl><Input v-bind="componentField" /></FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>

      <FormField v-slot="{ componentField }" name="token">
        <FormItem>
          <FormLabel>Token</FormLabel>
          <FormControl>
            <div class="flex space-x-4 mt-4">
              <Input v-bind="componentField" />
            </div>
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="body">
        <FormItem>
          <FormLabel>Request Body</FormLabel>
          <FormControl>
            <div class="flex space-x-4 mt-4">
              <Textarea v-bind="componentField" class="w-full h-32" />
            </div>
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="flex justify-end mt-4">
        <Button type="submit">Submit</Button>
      </div>

    </Form>
    <div class="flex space-x-4 mt-4">
      <Textarea class="w-full h-32" />
    </div>
    <div class="flex space-x-4 mt-4">
      <Textarea class="w-full h-32" />
    </div> -->

    <RouterView />
  </div>
</template>
